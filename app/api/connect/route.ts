export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, getMyStore, getStoreForUser } from "@/lib/data";
import { isFounderEmail } from "@/lib/access";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl(request.nextUrl.origin);
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(new URL("/login", appUrl));

  const storeId = request.nextUrl.searchParams.get("storeId");
  const store = storeId ? await getStoreForUser(storeId) : await getMyStore();
  if (!store) return NextResponse.redirect(new URL("/dashboard/stores", appUrl));

  const admin = createSupabaseAdminClient();
  if (!isFounderEmail(user.email)) {
    const { data: manager } = await admin
      .from("store_members")
      .select("id")
      .eq("store_id", store.id)
      .eq("user_id", user.id)
      .in("role", ["owner", "admin"])
      .maybeSingle();
    if (!manager) return NextResponse.json({ error: "Store manager access required." }, { status: 403 });
  }

  const stripe = getStripe();
  let accountId = store.stripe_account_id;
  const storefrontUrl = new URL(`/store/${store.slug}`, appUrl);
  const canShareStorefrontUrl = storefrontUrl.protocol === "https:" && !["localhost", "127.0.0.1"].includes(storefrontUrl.hostname);

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: user.email ?? undefined,
      capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
      business_profile: { name: store.name, ...(canShareStorefrontUrl ? { url: storefrontUrl.toString() } : {}) },
      metadata: { store_id: store.id, owner_id: store.owner_id }
    });
    accountId = account.id;
    const { error } = await admin.from("stores").update({ stripe_account_id: accountId }).eq("id", store.id);
    if (error) return NextResponse.json({ error: `Stripe account was created but could not be saved: ${error.message}` }, { status: 500 });
  }

  const accountLink = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appUrl}/api/connect/refresh?storeId=${store.id}`,
    return_url: `${appUrl}/api/connect/return?storeId=${store.id}`,
    type: "account_onboarding"
  });
  return NextResponse.redirect(accountLink.url);
}
