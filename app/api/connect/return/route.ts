export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });

  const supabase = createSupabaseServerClient();

  const { data: stores, error } = await supabase
    .from("stores")
    .select("*")
    .limit(1);

  const store = Array.isArray(stores) && stores.length ? stores[0] : null;

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!store || error) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings`);
  }

  let accountId = store.stripe_account_id as string | null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
    });

    await supabase
      .from("stores")
      .update({ stripe_account_id: account.id })
      .eq("id", store.id);

    accountId = account.id;
  }

  const loginLink = await stripe.accounts.createLoginLink(accountId);

  return NextResponse.redirect(loginLink.url);
}
