"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getActiveSubscriptionPlan,
  getMyStore,
  getCurrentUser,
  getProducts,
} from "@/lib/data";

import { canAddProduct } from "@/lib/plans";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  productInputSchema,
  storeInputSchema,
  toProductPayload,
  toStorePayload,
} from "@/lib/validation";

/* =========================
   STORE
========================= */

export async function upsertStore(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const parsed = storeInputSchema.parse(Object.fromEntries(formData));
  const supabase = createSupabaseServerClient();

  const payload = toStorePayload(parsed, user.id);

  // FIX DEFINITIVO (evita "never")
  const { data: existing } = await supabase
    .from("stores")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing && existing.id) {
    await supabase
      .from("stores")
      .update(payload)
      .eq("id", existing.id);
  } else {
    await supabase.from("stores").insert(payload);
  }

  revalidatePath("/dashboard");
  revalidatePath(`/store/${payload.slug}`);
  redirect("/dashboard/settings");
}

/* =========================
   PRODUCTS
========================= */

export async function upsertProduct(formData: FormData) {
  const store = await getMyStore();

  if (!store) {
    redirect("/dashboard/settings");
  }

  const parsed = productInputSchema.parse(Object.fromEntries(formData));
  const supabase = createSupabaseServerClient();

  const payload = toProductPayload(
    parsed,
    store.id,
    formData.get("active") === "on"
  );

  if (parsed.id) {
    await supabase
      .from("products")
      .update(payload)
      .eq("id", parsed.id)
      .eq("store_id", store.id);
  } else {
    const user = await getCurrentUser();
    const currentProducts = await getProducts(store.id);

    const plan = user
      ? await getActiveSubscriptionPlan(user.id, user.email)
      : "starter";

    if (!canAddProduct(plan, currentProducts.length)) {
      throw new Error("You reached the 500 product limit");
    }

    await supabase.from("products").insert(payload);
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/store/${store.slug}`);
}

/* =========================
   DELETE PRODUCT
========================= */

export async function deleteProduct(formData: FormData) {
  const store = await getMyStore();
  const id = String(formData.get("id") ?? "");

  if (!store || !id) return;

  const supabase = createSupabaseServerClient();

  await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("store_id", store.id);

  revalidatePath("/dashboard/products");
  revalidatePath(`/store/${store.slug}`);
}