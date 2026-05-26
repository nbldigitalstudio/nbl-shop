import { NextResponse } from "next/server";
import { getSellerStore } from "@/lib/connect";
import { getStripe } from "@/lib/stripe";

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { user, store } = await getSellerStore();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  if (!store?.stripe_account_id) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?connect=missing`);
  }

  const loginLink = await getStripe().accounts.createLoginLink(store.stripe_account_id);
  return NextResponse.redirect(loginLink.url);
}
