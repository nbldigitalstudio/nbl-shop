import { NextResponse } from "next/server";
import { getSellerStore, syncStripeAccountStatus } from "@/lib/connect";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  if (!store?.stripe_account_id) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?connect=missing`);
  }

  await syncStripeAccountStatus(store.id, store.stripe_account_id);

  return NextResponse.redirect(`${appUrl}/dashboard/billing?connect=returned`);
}
