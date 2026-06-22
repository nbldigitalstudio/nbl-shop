export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getMyStore, getStoreForUser } from "@/lib/data";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request.nextUrl.origin);
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.redirect(`${appUrl}/login`);
  }

  const requestedStoreId = request.nextUrl.searchParams.get("storeId");
  const store = requestedStoreId
    ? await getStoreForUser(requestedStoreId)
    : await getMyStore();

  if (!store?.stripe_account_id) {
    return NextResponse.redirect(`${appUrl}/dashboard/stores`);
  }

  const loginLink = await getStripe().accounts.createLoginLink(store.stripe_account_id);

  return NextResponse.redirect(loginLink.url);
}
