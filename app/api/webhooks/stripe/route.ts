import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { stripeAccountStatus } from "@/lib/connect";
import { normalizePlan } from "@/lib/plans";
import {
  sendNewOrderNotificationEmail,
  sendOrderReceivedEmail,
  sendPaymentFailedEmail,
  sendSubscriptionCreatedEmail,
  sendSubscriptionRenewedEmail,
} from "@/lib/email";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = headers().get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook is not configured." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createSupabaseAdminClient();

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const shipping = session.collected_information?.shipping_details ?? session.shipping_details;
    let cart: Array<{ productId: string; quantity: number }> = [];
    try {
      cart = JSON.parse(session.metadata?.cart ?? "[]");
    } catch {
      cart = [];
    }

    const paymentStatus = session.payment_status;
    const subtotalCents = Number(session.metadata?.subtotal_cents ?? 0);
    const shippingAmountCents = Number(session.metadata?.shipping_amount_cents ?? 0);
    const { data: paidOrder } = await supabase
      .from("orders")
      .update({
        status: paymentStatus === "paid" ? "paid" : "pending",
        payment_status: paymentStatus,
        customer_email: session.customer_details?.email ?? session.customer_email ?? null,
        subtotal_cents: Number.isFinite(subtotalCents) ? subtotalCents : 0,
        shipping_amount_cents: Number.isFinite(shippingAmountCents) ? shippingAmountCents : 0,
        amount_total_cents: session.amount_total ?? 0,
        shipping_name: shipping?.name ?? session.customer_details?.name ?? null,
        shipping_address: [shipping?.address?.line1, shipping?.address?.line2].filter(Boolean).join(", ") || null,
        shipping_city: shipping?.address?.city ?? null,
        shipping_state: shipping?.address?.state ?? null,
        shipping_zip: shipping?.address?.postal_code ?? null,
        shipping_country: shipping?.address?.country ?? null,
        shipping_status: "pending"
      })
      .eq("stripe_checkout_session_id", session.id)
      .neq("payment_status", "paid")
      .select("id, store_id, customer_email, shipping_name, subtotal_cents, shipping_amount_cents, amount_total_cents, stores(name, slug, owner_email)")
      .maybeSingle();

    if (paidOrder && paymentStatus === "paid") {
      for (const item of cart) {
        await supabase.rpc("decrement_product_stock", {
          product_id_input: item.productId,
          quantity_input: item.quantity
        });
      }

      const store = Array.isArray(paidOrder.stores) ? paidOrder.stores[0] : paidOrder.stores;
      const orderEmail = {
        orderId: paidOrder.id,
        storeName: store?.name ?? "NBL Shop",
        storeSlug: store?.slug,
        customerName: paidOrder.shipping_name,
        customerEmail: paidOrder.customer_email,
        subtotalCents: paidOrder.subtotal_cents ?? subtotalCents,
        shippingAmountCents: paidOrder.shipping_amount_cents ?? shippingAmountCents,
        totalCents: paidOrder.amount_total_cents ?? session.amount_total ?? 0,
      };

      await Promise.all([
        sendOrderReceivedEmail(orderEmail),
        sendNewOrderNotificationEmail({
          ...orderEmail,
          to: store?.owner_email,
        }),
      ]);
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    await supabase
      .from("stores")
      .update(stripeAccountStatus(account))
      .eq("stripe_account_id", account.id);
  }

  if (
    event.type === "customer.subscription.created" ||
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const plan = normalizePlan(subscription.metadata.plan);
    const userId = subscription.metadata.user_id;
    const storeId = subscription.metadata.store_id;
    const interval = subscription.metadata.interval === "year" ? "year" : "month";

    if (userId && storeId) {
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          store_id: storeId,
          stripe_customer_id: String(subscription.customer),
          stripe_subscription_id: subscription.id,
          plan,
          billing_interval: interval,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        },
        { onConflict: "stripe_subscription_id" }
      );

      // Billing status is informational only. Never disable the store or its checkout.
      await supabase
        .from("stores")
        .update({ plan, billing_status: subscription.status })
        .eq("id", storeId);

      if (event.type === "customer.subscription.created") {
        const { data: store } = await supabase
          .from("stores")
          .select("name, owner_email")
          .eq("id", storeId)
          .maybeSingle();

        await sendSubscriptionCreatedEmail({
          to: store?.owner_email,
          storeName: store?.name ?? "tu tienda",
          plan,
          interval,
        });
      }
    }
  }

  if (event.type === "invoice.payment_failed" || event.type === "invoice.paid") {
    const invoice = event.data.object as Stripe.Invoice & {
      subscription?: string | Stripe.Subscription | null;
      parent?: { subscription_details?: { subscription?: string | Stripe.Subscription | null } } | null;
    };
    const subscriptionReference = invoice.subscription ?? invoice.parent?.subscription_details?.subscription;
    const subscriptionId = typeof subscriptionReference === "string"
      ? subscriptionReference
      : subscriptionReference?.id;

    if (subscriptionId) {
      const billingStatus = event.type === "invoice.paid" ? "active" : "past_due";
      const { data: subscriptionRecord } = await supabase
        .from("subscriptions")
        .update({ status: billingStatus })
        .eq("stripe_subscription_id", subscriptionId)
        .select("store_id")
        .maybeSingle();

      if (subscriptionRecord?.store_id) {
        await supabase
          .from("stores")
          .update({ billing_status: billingStatus })
          .eq("id", subscriptionRecord.store_id);

        const { data: store } = await supabase
          .from("stores")
          .select("name, owner_email")
          .eq("id", subscriptionRecord.store_id)
          .maybeSingle();

        if (event.type === "invoice.payment_failed") {
          await sendPaymentFailedEmail({
            to: store?.owner_email,
            storeName: store?.name ?? "tu tienda",
          });
        } else {
          await sendSubscriptionRenewedEmail({
            to: store?.owner_email,
            storeName: store?.name ?? "tu tienda",
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
