import { NextResponse } from "next/server";
import { getSellerStore, syncStripeAccountStatus } from "@/lib/connect";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const { supabase, user, store } = await getSellerStore();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  if (!store) {
    return NextResponse.redirect(`${appUrl}/dashboard/settings`);
  }

  const stripe = getStripe();
  let accountId = store.stripe_account_id;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true }
      },
      business_profile: {
        name: store.name,
        url: `${appUrl}/store/${store.slug}`
      },
      metadata: {
        store_id: store.id,
        owner_id: user.id
      }
    });

    accountId = account.id;
    await supabase.from("stores").update({ stripe_account_id: accountId }).eq("id", store.id);
  } else {
    await syncStripeAccountStatus(store.id, accountId);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/connect/refresh`,
    return_url: `${appUrl}/api/connect/return`,
    type: "account_onboarding"
  });

  return NextResponse.redirect(link.url);
}
