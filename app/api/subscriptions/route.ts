export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isFounderEmail } from "@/lib/access";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { resolveCheckoutDiscount } from "@/lib/stripe-discounts";
import { getStripePriceId, PLANS } from "@/lib/plans";

const schema = z.enum(["starter", "business", "pro"]);

export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const supabase = createSupabaseRouteClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (!user?.email) {
    return NextResponse.redirect(appUrl);
  }

  if (isFounderEmail(user.email)) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?founder=active`);
  }

  const plan = schema.parse(request.nextUrl.searchParams.get("plan"));
  const promoCode = request.nextUrl.searchParams.get("promoCode")?.trim();
  const price = getStripePriceId(plan);

  if (!price) {
    return NextResponse.json({ error: `Missing Stripe price for ${plan}.` }, { status: 400 });
  }

  const stripe = getStripe();
  const discount = await resolveCheckoutDiscount(stripe, promoCode);

  if (promoCode && !discount) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?error=${encodeURIComponent("Invalid promo code")}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: discount ? undefined : true,
    discounts: discount ? [discount] : undefined,
    subscription_data: {
      trial_period_days: PLANS[plan].trialDays,
      metadata: {
        user_id: user.id,
        plan
      }
    },
    success_url: `${appUrl}/dashboard/billing?subscription=success`,
    cancel_url: `${appUrl}/dashboard/billing?subscription=cancelled`
  });

  return NextResponse.redirect(session.url ?? `${appUrl}/dashboard/billing`);
}
