export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getMyStore } from "@/lib/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET() {
  const store = await getMyStore();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (!store) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings`);
  }

  // 🔥 FIX TS: aseguramos tipo seguro
  let accountId: string | null = store.stripe_account_id ?? null;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
    });

    const supabase = createSupabaseServerClient();

    await supabase
      .from("stores")
      .update({ stripe_account_id: account.id })
      .eq("id", store.id);

    accountId = account.id;
  }

  const loginLink = await stripe.accounts.createLoginLink(accountId);

  return NextResponse.redirect(loginLink.url);
}
