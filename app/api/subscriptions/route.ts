export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isFounderEmail } from "@/lib/access";
import { getStoreForUser } from "@/lib/data";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { resolveCheckoutDiscount } from "@/lib/stripe-discounts";
import { getStripePriceId } from "@/lib/plans";
import { getAppUrl } from "@/lib/url";

const planSchema = z.enum(["basic", "pro"]);
const intervalSchema = z.enum(["month", "year"]);
const storeIdSchema = z.string().uuid();
const promoCodeSchema = z.string().trim().min(1).max(100);

export async function POST(request: NextRequest) {
  const supabase = createSupabaseRouteClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) {
    return NextResponse.json({ error: "Debes iniciar sesión para validar el código." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const parsedCode = promoCodeSchema.safeParse(payload?.promoCode);
  if (!parsedCode.success) {
    return NextResponse.json({ error: "Este código no es válido o expiró." }, { status: 400 });
  }

  const code = parsedCode.data.toUpperCase();
  const discount = await resolveCheckoutDiscount(getStripe(), code);
  if (!discount) {
    return NextResponse.json({ error: "Este código no es válido o expiró." }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code,
    message: code === "2MONTHPASS" ? "Código aplicado: 2 meses gratis." : `Código aplicado: ${code}.`
  });
}

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request.nextUrl.origin);
  const supabase = createSupabaseRouteClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return NextResponse.redirect(`${appUrl}/login`);
  if (isFounderEmail(user.email)) return NextResponse.redirect(`${appUrl}/dashboard/billing?founder=active`);

  const parsedPlan = planSchema.safeParse(request.nextUrl.searchParams.get("plan"));
  const parsedInterval = intervalSchema.safeParse(request.nextUrl.searchParams.get("interval"));
  const parsedStoreId = storeIdSchema.safeParse(request.nextUrl.searchParams.get("storeId"));
  if (!parsedPlan.success || !parsedInterval.success || !parsedStoreId.success) {
    return NextResponse.json({ error: "Invalid subscription selection." }, { status: 400 });
  }
  const store = await getStoreForUser(parsedStoreId.data);
  if (!store) return NextResponse.json({ error: "Store not found." }, { status: 404 });

  const price = getStripePriceId(parsedPlan.data, parsedInterval.data);
  if (!price) {
    return NextResponse.json({ error: `Missing Stripe ${parsedPlan.data} ${parsedInterval.data} price.` }, { status: 400 });
  }

  const stripe = getStripe();
  const promoCode = request.nextUrl.searchParams.get("promoCode")?.trim();
  const discount = await resolveCheckoutDiscount(stripe, promoCode);
  if (promoCode && !discount) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?error=${encodeURIComponent("Este código no es válido o expiró.")}`);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: user.email,
    line_items: [{ price, quantity: 1 }],
    allow_promotion_codes: discount ? undefined : true,
    discounts: discount ? [discount] : undefined,
    metadata: { user_id: user.id, store_id: store.id, plan: parsedPlan.data, interval: parsedInterval.data },
    subscription_data: {
      metadata: { user_id: user.id, store_id: store.id, plan: parsedPlan.data, interval: parsedInterval.data }
    },
    success_url: `${appUrl}/dashboard/billing?subscription=success`,
    cancel_url: `${appUrl}/dashboard/billing?subscription=cancelled`
  });

  return NextResponse.redirect(session.url ?? `${appUrl}/dashboard/billing`);
}
