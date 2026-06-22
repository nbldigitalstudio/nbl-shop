"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";

import {
  getActiveSubscriptionPlan,
  getCurrentUser,
  getMyStore,
  getProducts,
  getStoreForUser,
} from "@/lib/data";

import { canAddProduct } from "@/lib/plans";
import { isFounderEmail } from "@/lib/access";
import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import type { StoreRole } from "@/lib/types";
import { getAppUrl } from "@/lib/url";

import {
  productInputSchema,
  storeInputSchema,
  toProductPayload,
  toStorePayload,
} from "@/lib/validation";

/* =========================
   HELPERS
========================= */

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value : null;
}

/* =========================
   STORE
========================= */

export async function upsertStore(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = storeInputSchema.parse(Object.fromEntries(formData));
  const supabase = createSupabaseServerClient();

  const payload = toStorePayload(parsed, user.id);

  const storeId = formString(formData, "store_id");

  let redirectPath = "/dashboard/stores";

  if (storeId) {
    const existing = await getStoreForUser(storeId);
    if (!existing) throw new Error("Store not found");

    const storeClient = isFounderEmail(user.email) ? createSupabaseAdminClient() : supabase;
    const { owner_id: _ownerId, ...updatePayload } = payload;
    const { error } = await storeClient
      .from("stores")
      .update(updatePayload)
      .eq("id", storeId);

    if (error) throw error;

    redirectPath = `/dashboard/stores/${storeId}/settings`;
  } else {
    if (!isFounderEmail(user.email)) throw new Error("Only the founder can create stores");
    const { error } = await supabase.from("stores").insert({ ...payload, plan: "basic" });
    if (error) throw error;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/stores");
  revalidatePath("/dashboard/settings");
  revalidatePath(`/store/${payload.slug}`);

  redirect(redirectPath);
}

/* =========================
   PRODUCTS
========================= */

export async function upsertProduct(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const storeId = formString(formData, "store_id");

  const store = storeId
    ? await getStoreForUser(storeId)
    : await getMyStore();

  if (!store?.id) redirect("/dashboard/stores");

  const raw = Object.fromEntries(formData);
  const parsed = productInputSchema.safeParse(raw);

  if (!parsed.success) {
    console.error(parsed.error.flatten());
    throw new Error("Invalid product data");
  }

  const supabase = createSupabaseServerClient();
  const productClient = isFounderEmail(user.email) ? createSupabaseAdminClient() : supabase;

  const payload = toProductPayload(
    parsed.data,
    store.id,
    parsed.data.active
  );

  // UPDATE
  if (parsed.data.id) {
    const { error } = await productClient
      .from("products")
      .update(payload)
      .eq("id", parsed.data.id)
      .eq("store_id", store.id);

    if (error) throw error;
  }

  // CREATE
  else {
    const currentProducts = await getProducts(store.id);
    const plan = await getActiveSubscriptionPlan(store.id, user.email);

    if (!canAddProduct(plan, currentProducts.length)) {
      throw new Error("You reached the product limit");
    }

    const { error } = await productClient.from("products").insert(payload);

    if (error) throw error;
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/stores/${store.id}`);
  revalidatePath(`/dashboard/stores/${store.id}/products`);
  revalidatePath(`/store/${store.slug}`);

  return;
}

/* =========================
   STORE MEMBERS
========================= */

export async function inviteStoreMember(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const storeId = formString(formData, "store_id");
  const email = formString(formData, "email")?.toLowerCase();
  const requestedRole = formString(formData, "role");
  const role: StoreRole = requestedRole === "owner" || requestedRole === "admin" ? requestedRole : "staff";

  if (!storeId || !email) throw new Error("Store and email are required");
  const store = await getStoreForUser(storeId);
  if (!store) throw new Error("Store not found");

  const admin = createSupabaseAdminClient();
  if (!isFounderEmail(user.email)) {
    const { data: membership } = await admin
      .from("store_members")
      .select("role")
      .eq("store_id", storeId)
      .eq("user_id", user.id)
      .in("role", ["owner", "admin"])
      .maybeSingle();
    if (!membership) throw new Error("You cannot invite members to this store");
  }

  const { error } = await admin.from("store_invitations").upsert(
    { store_id: storeId, email, role, invited_by: user.id, status: "pending", accepted_at: null },
    { onConflict: "store_id,email" }
  );
  if (error) throw error;

  const appUrl = getAppUrl();
  const invite = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/dashboard`
  });
  if (invite.error && !invite.error.message.toLowerCase().includes("already")) {
    console.warn("Supabase invitation email could not be sent:", invite.error.message);
  }

  revalidatePath(`/dashboard/stores/${storeId}/settings`);
}

/* =========================
   BILLING GRACE CODES
========================= */

export async function createGraceCode(formData: FormData) {
  const user = await getCurrentUser();
  if (!user || !isFounderEmail(user.email)) throw new Error("Founder access required");

  const days = Math.min(Math.max(Number(formString(formData, "days") ?? 15), 1), 90);
  const code = `GRACE-${randomBytes(4).toString("hex").toUpperCase()}`;
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("billing_codes").insert({
    code,
    kind: "grace",
    grace_days: days,
    active: true,
    created_by: user.id
  });
  if (error) throw error;
  revalidatePath("/dashboard/billing");
}

export async function redeemGraceCode(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const storeId = formString(formData, "store_id");
  const code = formString(formData, "code")?.toUpperCase();
  if (!storeId || !code) throw new Error("Store and code are required");
  const store = await getStoreForUser(storeId);
  if (!store) throw new Error("Store not found");

  const admin = createSupabaseAdminClient();
  const { data: billingCode } = await admin
    .from("billing_codes")
    .select("*")
    .eq("code", code)
    .eq("kind", "grace")
    .eq("active", true)
    .maybeSingle();
  if (!billingCode || (billingCode.expires_at && new Date(billingCode.expires_at) < new Date())) {
    throw new Error("Grace code is invalid or expired");
  }
  if (billingCode.max_redemptions && billingCode.redemption_count >= billingCode.max_redemptions) {
    throw new Error("Grace code has reached its redemption limit");
  }

  const graceUntil = new Date(Date.now() + billingCode.grace_days * 86_400_000).toISOString();
  const { error } = await admin.from("billing_code_redemptions").insert({
    billing_code_id: billingCode.id,
    user_id: user.id,
    store_id: storeId,
    grace_until: graceUntil
  });
  if (error) throw error;
  await Promise.all([
    admin.from("stores").update({ billing_grace_until: graceUntil }).eq("id", storeId),
    admin.from("billing_codes").update({ redemption_count: billingCode.redemption_count + 1 }).eq("id", billingCode.id)
  ]);
  revalidatePath("/dashboard/billing");
}

/* =========================
   DELETE PRODUCT
========================= */

export async function deleteProduct(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const id = formString(formData, "id");
  const storeId = formString(formData, "store_id");

  const store = storeId
    ? await getStoreForUser(storeId)
    : await getMyStore();

  if (!store?.id || !id) {
    throw new Error("Missing store or product id");
  }

  const supabase = createSupabaseServerClient();
  const productClient = isFounderEmail(user.email) ? createSupabaseAdminClient() : supabase;

  const { error } = await productClient
    .from("products")
    .delete()
    .eq("id", id)
    .eq("store_id", store.id);

  if (error) throw error;

  revalidatePath("/dashboard/products");
  revalidatePath(`/dashboard/stores/${store.id}`);
  revalidatePath(`/dashboard/stores/${store.id}/products`);
  revalidatePath(`/store/${store.slug}`);

  return;
}
