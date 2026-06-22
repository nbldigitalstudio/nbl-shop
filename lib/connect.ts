import type Stripe from "stripe";
import { createSupabaseAdminClient, createSupabaseRouteClient } from "@/lib/supabase/server";
import { getMyStore, getStoreForUser } from "@/lib/data";
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
  plan?: string;
};

export async function getSellerStore(storeId?: string | null) {
  const supabase = createSupabaseRouteClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, store: null };
  }

  const store = storeId ? await getStoreForUser(storeId) : await getMyStore();

  return {
    supabase,
    user,
    store: (store ?? null) as SellerStore | null,
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

  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from("stores").update(status).eq("id", storeId);

  if (error) {
    throw new Error(`Could not update Stripe status: ${error.message}`);
  }

  return status;
}
