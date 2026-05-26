import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { platformFee, getStripe } from "@/lib/stripe";

const cartSchema = z.array(
  z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(99)
  })
);

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  let rawCart: unknown = [];
  try {
    rawCart = JSON.parse(String(formData.get("cart") ?? "[]"));
  } catch {
    rawCart = [];
  }

  const cart = cartSchema.safeParse(rawCart);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!cart.success || !cart.data.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();
  const ids = cart.data.map((item) => item.productId);
  const { data: products } = await supabase
    .from("products")
    .select("*, stores(*)")
    .in("id", ids)
    .eq("active", true)
    .gt("stock", 0);

  if (!products?.length || products.length !== ids.length) {
    return NextResponse.json({ error: "Some cart items are not available." }, { status: 400 });
  }

  const store = products[0].stores;
  const sameStore = products.every((product) => product.store_id === products[0].store_id);

  if (!sameStore || !store?.stripe_account_id || !store?.stripe_charges_enabled || !store?.stripe_payouts_enabled) {
    return NextResponse.json({ error: "This seller is not ready to accept payments." }, { status: 400 });
  }

  const enrichedCart = cart.data.map((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product || product.stock < item.quantity) {
      return null;
    }

    return { ...item, product };
  });

  if (enrichedCart.some((item) => item === null)) {
    return NextResponse.json({ error: "Insufficient stock." }, { status: 400 });
  }

  const stripe = getStripe();
  const validCart = enrichedCart.filter((item) => item !== null);
  const total = validCart.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0);
  const fee = platformFee(total);
  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: validCart.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          unit_amount: item.product.price_cents,
          product_data: {
              name: item.product.name,
              description: item.product.description ?? undefined,
            images: item.product.image_url ? [item.product.image_url] : undefined
          }
        }
      })),
      payment_method_types: ["card"],
      automatic_tax: { enabled: false },
      payment_intent_data: {
        application_fee_amount: fee,
        transfer_data: {
          destination: store.stripe_account_id
        },
        metadata: {
          store_id: products[0].store_id
        }
      },
      metadata: {
        cart: JSON.stringify(cart.data),
        store_id: products[0].store_id,
        application_fee_cents: String(fee)
      },
      success_url: `${appUrl}/store/${store.slug}?checkout=success`,
      cancel_url: `${appUrl}/store/${store.slug}?checkout=cancelled`
    }
  );

  const { data: order } = await supabase
    .from("orders")
    .insert({
      store_id: products[0].store_id,
      stripe_checkout_session_id: session.id,
      amount_total_cents: total,
      application_fee_cents: fee,
      status: "pending"
    })
    .select("id")
    .single();

  if (order) {
    await supabase.from("order_items").insert(
      validCart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_amount_cents: item.product.price_cents
      }))
    );
  }

  return NextResponse.redirect(session.url ?? `${appUrl}/store/${store.slug}`, 303);
}
