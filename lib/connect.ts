import type Stripe from "stripe";
import { createSupabaseRouteClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

export type SellerStore = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean | null;
  stripe_payouts_enabled: boolean | null;
  stripe_details_submitted: boolean | null;
};

export async function getSellerStore() {
  const supabase = createSupabaseRouteClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, store: null };
  }

  const { data: store } = await supabase
    .from("stores")
    .select(
      "id, owner_id, name, slug, stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted"
    )
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return {
    supabase,
    user,
    store: store ?? null,
  };
}

/* =========================
   STRIPE HELPERS
========================= */

export function stripeAccountStatus(account: Stripe.Account) {
  return {
    stripe_charges_enabled: Boolean(account.charges_enabled),
    stripe_payouts_enabled: Boolean(account.payouts_enabled),
    stripe_details_submitted: Boolean(account.details_submitted),
  };
}

export async function syncStripeAccountStatus(
  storeId: string,
  accountId: string
) {
  const stripe = getStripe();

  const account = await stripe.accounts.retrieve(accountId);

  const status = stripeAccountStatus(account);

  const supabase = createSupabaseRouteClient();

  await supabase.from("stores").update(status).eq("id", storeId);

  return status;
}