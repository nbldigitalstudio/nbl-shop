import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isFounderEmail } from "@/lib/access";
import type { AccessPlan } from "@/lib/plans";
import type { DashboardMetrics, Order, Product, Store, Subscription } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

export async function getMyStore() {
  const supabase = createSupabaseServerClient();
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .returns<Store>()
    .maybeSingle();

  return data;
}

export async function getStoreBySlug(slug: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .returns<Store>()
    .maybeSingle();

  return data;
}

export async function getProducts(storeId: string, activeOnly = false) {
  const supabase = createSupabaseServerClient();
  let query = supabase
    .from("products")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("active", true).gt("stock", 0);
  }

  const { data } = await query.returns<Product[]>();
  return data ?? [];
}

export async function getOrders(storeId: string) {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false })
    .returns<Order[]>();

  return data ?? [];
}

export async function getActiveSubscriptionPlan(userId: string, email?: string | null): Promise<AccessPlan> {
  if (isFounderEmail(email)) {
    return "founder";
  }

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .in("status", ["trialing", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<Subscription>()
    .maybeSingle();

  return data?.plan ?? "starter";
}

export async function getDashboardMetrics(storeId: string): Promise<DashboardMetrics> {
  const [orders, products] = await Promise.all([getOrders(storeId), getProducts(storeId)]);
  const paidOrders = orders.filter((order) => order.status === "paid" || order.status === "fulfilled");
  const revenueCents = paidOrders.reduce((sum, order) => sum + order.amount_total_cents, 0);

  return {
    revenueCents,
    orderCount: paidOrders.length,
    productCount: products.length,
    averageOrderCents: paidOrders.length ? Math.round(revenueCents / paidOrders.length) : 0
  };
}
