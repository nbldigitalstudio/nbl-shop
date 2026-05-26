import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { stripeAccountStatus } from "@/lib/connect";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    let cart: Array<{ productId: string; quantity: number }> = [];
    try {
      cart = JSON.parse(session.metadata?.cart ?? "[]");
    } catch {
      cart = [];
    }

    await supabase
      .from("orders")
      .update({
        status: "paid",
        customer_email: session.customer_details?.email ?? session.customer_email ?? null,
        amount_total_cents: session.amount_total ?? 0
      })
      .eq("stripe_checkout_session_id", session.id);

    for (const item of cart) {
      await supabase.rpc("decrement_product_stock", {
        product_id_input: item.productId,
        quantity_input: item.quantity
      });
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
    const plan = subscription.metadata.plan;
    const userId = subscription.metadata.user_id;

    if (userId && (plan === "starter" || plan === "business" || plan === "pro")) {
      await supabase.from("subscriptions").upsert(
        {
          user_id: userId,
          stripe_customer_id: String(subscription.customer),
          stripe_subscription_id: subscription.id,
          plan,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        },
        { onConflict: "stripe_subscription_id" }
      );
    }
  }

  return NextResponse.json({ received: true });
}
