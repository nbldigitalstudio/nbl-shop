import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isFounderEmail } from "@/lib/access";
import type { AccessPlan } from "@/lib/plans";
import type { DashboardMetrics, Order, Product } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return data.user ?? null;
}

export async function getMyStore() {
  const supabase = createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}

export async function getStoreBySlug(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return data ?? null;
}

export async function getProducts(storeId: string, activeOnly: boolean = false) {
  const supabase = createSupabaseServerClient();

  let query = supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("active", true).gt("stock", 0);
  }

  const { data } = await query;

  return (data ?? []) as Product[];
}

export async function getOrders(storeId: string) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

export async function getActiveSubscriptionPlan(
  userId: string,
  email?: string | null
): Promise<AccessPlan> {
  if (isFounderEmail(email)) return "founder";

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("subscriptions")
    .select("plan")
    .eq("user_id", userId)
    .in("status", ["trialing", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.plan as AccessPlan) ?? "starter";
}

export async function getDashboardMetrics(
  storeId: string
): Promise<DashboardMetrics> {
  const [orders, products] = await Promise.all([
    getOrders(storeId),
    getProducts(storeId),
  ]);

  const paidOrders = orders.filter(
    (o) => o.status === "paid" || o.status === "fulfilled"
  );

  const revenueCents = paidOrders.reduce(
    (sum, o) => sum + (o.amount_total_cents ?? 0),
    0
  );

  return {
    revenueCents,
    orderCount: paidOrders.length,
    productCount: products.length,
    averageOrderCents: paidOrders.length
      ? Math.round(revenueCents / paidOrders.length)
      : 0,
  };
}