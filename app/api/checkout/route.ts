import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { platformFee, getStripe } from "@/lib/stripe";
import { getPlanFeePercent, normalizePlan } from "@/lib/plans";
import { getAppUrl as resolveAppUrl } from "@/lib/url";

const cartSchema = z.array(
  z.object({
    productId: z.string().uuid(),
    quantity: z.coerce.number().int().min(1).max(99),
  })
);

const storeIdSchema = z.string().uuid();

function getAppUrl(request: NextRequest) {
  return resolveAppUrl(request.nextUrl.origin);
}

function checkoutError(
  message: string,
  status: number,
  appUrl: string,
  storeSlug?: string
) {
  if (storeSlug) {
    const url = new URL(`/store/${storeSlug}`, appUrl);
    url.searchParams.set("checkout", "error");
    url.searchParams.set("message", message);
    return NextResponse.redirect(url, 303);
  }

  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const appUrl = getAppUrl(request);

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "Invalid checkout request." },
      { status: 400 }
    );
  }

  let rawCart: unknown = [];

  try {
    rawCart = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    rawCart = [];
  }

  const cart = cartSchema.safeParse(rawCart);
  const storeId = storeIdSchema.safeParse(formData.get("store_id"));

  if (!cart.success || !cart.data.length || !storeId.success) {
    return checkoutError(
      "Your cart or store is invalid.",
      400,
      appUrl
    );
  }

  const ids = cart.data.map((item) => item.productId);
  const uniqueIds = new Set(ids);

  if (uniqueIds.size !== ids.length) {
    return checkoutError(
      "Your cart contains duplicate products.",
      400,
      appUrl
    );
  }

  const supabase = createSupabaseAdminClient();

  const { data: store, error: storeError } = await supabase
    .from("stores")
    .select(
      "id, slug, plan, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted"
    )
    .eq("id", storeId.data)
    .maybeSingle();

  if (storeError || !store) {
    return checkoutError(
      "This store could not be found.",
      404,
      appUrl
    );
  }

  if (
    !store.stripe_account_id ||
    !store.stripe_charges_enabled ||
    !store.stripe_payouts_enabled ||
    !store.stripe_details_submitted
  ) {
    return checkoutError(
      "This seller is not ready to accept payments yet.",
      400,
      appUrl,
      store.slug
    );
  }

  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(
      "id, store_id, name, description, image_url, price_cents, stock, active"
    )
    .in("id", ids)
    .eq("store_id", store.id)
    .eq("active", true)
    .gt("stock", 0);

  if (productsError || !products || products.length !== ids.length) {
    return checkoutError(
      "Some cart items are not available.",
      400,
      appUrl,
      store.slug
    );
  }

  const validCart = cart.data.map((item) => {
    const product = products.find(
      (candidate) => candidate.id === item.productId
    );

    if (!product || product.stock < item.quantity) {
      return null;
    }

    return {
      product,
      quantity: item.quantity,
    };
  });

  if (validCart.some((item) => item === null)) {
    return checkoutError(
      "There is not enough stock for one or more products.",
      400,
      appUrl,
      store.slug
    );
  }

  const items = validCart.filter(Boolean) as {
    product: {
      id: string;
      name: string;
      description: string | null;
      image_url: string | null;
      price_cents: number;
      stock: number;
    };
    quantity: number;
  }[];

  const total = items.reduce(
    (sum, item) => sum + item.product.price_cents * item.quantity,
    0
  );

  const plan = normalizePlan(store.plan);
  const feePercent = getPlanFeePercent(plan);
  const fee = platformFee(total, feePercent);

  if (total <= 0) {
    return checkoutError(
      "Checkout total must be greater than zero.",
      400,
      appUrl,
      store.slug
    );
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      store_id: store.id,
      amount_total_cents: total,
      application_fee_cents: fee,
      status: "pending",
      payment_status: "unpaid",
      shipping_status: "pending",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    return checkoutError(
      "We could not start this order. Please try again.",
      500,
      appUrl,
      store.slug
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product.id,
      quantity: item.quantity,
      unit_amount_cents: item.product.price_cents,
    }))
  );

  if (itemsError) {
    await supabase.from("orders").delete().eq("id", order.id);

    return checkoutError(
      "We could not save the order items. Please try again.",
      500,
      appUrl,
      store.slug
    );
  }

  try {
    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      payment_method_types: ["card"],

      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.product.price_cents,
          product_data: {
            name: item.product.name,
            description: item.product.description?.trim() || undefined,
            images: item.product.image_url
              ? [item.product.image_url]
              : undefined,
          },
        },
      })),

      automatic_tax: {
        enabled: false,
      },

      shipping_address_collection: {
        allowed_countries: ["US"],
      },

      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: {
          destination: store.stripe_account_id,
        },
        metadata: {
          store_id: store.id,
          order_id: order.id,
        },
      },

      metadata: {
        store_id: store.id,
        order_id: order.id,
        application_fee_cents: String(fee),
        plan,
        fee_percent: String(feePercent),
        cart: JSON.stringify(cart.data),
      },

      success_url: `${appUrl}/store/${store.slug}?checkout=success`,
      cancel_url: `${appUrl}/store/${store.slug}?checkout=cancelled`,
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    const { error: sessionSaveError } = await supabase
      .from("orders")
      .update({
        stripe_checkout_session_id: session.id,
      })
      .eq("id", order.id);

    if (sessionSaveError) {
      await stripe.checkout.sessions.expire(session.id);
      await supabase.from("orders").delete().eq("id", order.id);

      return checkoutError(
        "We could not finalize this checkout. Please try again.",
        500,
        appUrl,
        store.slug
      );
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error: any) {
    await supabase.from("orders").delete().eq("id", order.id);

    console.error("Stripe checkout session creation failed:", {
      message: error?.message,
      type: error?.type,
      code: error?.code,
      param: error?.param,
      requestId: error?.requestId,
      statusCode: error?.statusCode,
    });

    return checkoutError(
      error?.message ?? "Stripe could not start checkout. Please try again.",
      502,
      appUrl,
      store.slug
    );
  }
}
