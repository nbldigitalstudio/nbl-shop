import { createSupabaseAdminClient, createSupabaseServerClient } from "@/lib/supabase/server";
import { isFounderEmail } from "@/lib/access";
import { normalizePlan, type AccessPlan } from "@/lib/plans";
import type {
  DashboardMetrics,
  Order,
  OrderDetails,
  OrderWithStore,
  Product,
  Store,
  StoreInvitation,
  StoreMemberWithProfile
} from "@/lib/types";

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return data.user ?? null;
}

export async function getMyStore() {
  const stores = await getMyStores();
  return stores[0] ?? null;
}

export async function getMyStores() {
  const user = await getCurrentUser();

  if (!user) return [];

  if (isFounderEmail(user.email)) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase
      .from("stores")
      .select("*")
      .order("created_at", { ascending: true });
    return (data ?? []) as Store[];
  }

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("stores")
    .select("*, store_members!inner(user_id)")
    .eq("store_members.user_id", user.id)
    .order("created_at", { ascending: true });

  return (data ?? []) as Store[];
}

export async function getStoreForUser(storeId: string) {
  const user = await getCurrentUser();

  if (!user) return null;

  if (isFounderEmail(user.email)) {
    const supabase = createSupabaseAdminClient();
    const { data } = await supabase.from("stores").select("*").eq("id", storeId).maybeSingle();
    return (data ?? null) as Store | null;
  }

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("stores")
    .select("*, store_members!inner(user_id)")
    .eq("id", storeId)
    .eq("store_members.user_id", user.id)
    .maybeSingle();

  return (data ?? null) as Store | null;
}

export async function getStoreBySlug(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  return (data ?? null) as Store | null;
}

export async function getProducts(storeId: string, activeOnly: boolean = false) {
  const user = await getCurrentUser();
  const supabase = isFounderEmail(user?.email) ? createSupabaseAdminClient() : createSupabaseServerClient();

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
  const user = await getCurrentUser();
  const supabase = isFounderEmail(user?.email) ? createSupabaseAdminClient() : createSupabaseServerClient();

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

export async function getMyOrders() {
  const user = await getCurrentUser();
  const supabase = isFounderEmail(user?.email) ? createSupabaseAdminClient() : createSupabaseServerClient();
  const stores = await getMyStores();

  if (!stores.length) return [];

  const { data } = await supabase
    .from("orders")
    .select("*, stores!inner(id, name, slug)")
    .in(
      "store_id",
      stores.map((store) => store.id)
    )
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as OrderWithStore[];
}

export async function getOrderForUser(orderId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = isFounderEmail(user.email)
    ? createSupabaseAdminClient()
    : createSupabaseServerClient();
  const stores = await getMyStores();
  if (!stores.length) return null;

  const { data } = await supabase
    .from("orders")
    .select(
      "*, stores!inner(id, name, slug, owner_id), order_items(*, products(name, image_url))"
    )
    .eq("id", orderId)
    .in("store_id", stores.map((store) => store.id))
    .maybeSingle();

  return (data ?? null) as unknown as OrderDetails | null;
}

export async function getActiveSubscriptionPlan(
  storeId: string,
  email?: string | null
): Promise<AccessPlan> {
  if (isFounderEmail(email)) return "founder";

  const supabase = createSupabaseServerClient();

  const { data } = await supabase
    .from("stores")
    .select("plan")
    .eq("id", storeId)
    .maybeSingle();

  return normalizePlan(data?.plan);
}

export async function getStoreMembers(storeId: string) {
  const store = await getStoreForUser(storeId);
  if (!store) return [];
  const user = await getCurrentUser();
  const supabase = isFounderEmail(user?.email) ? createSupabaseAdminClient() : createSupabaseServerClient();
  const { data } = await supabase
    .from("store_members")
    .select("*, profiles(email, full_name)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: true });
  return (data ?? []) as unknown as StoreMemberWithProfile[];
}

export async function getMyStoreRole(storeId: string) {
  const user = await getCurrentUser();
  if (!user) return null;
  if (isFounderEmail(user.email)) return "owner" as const;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("store_members")
    .select("role")
    .eq("store_id", storeId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data?.role as "owner" | "admin" | "staff" | undefined) ?? null;
}

export async function getStoreInvitations(storeId: string) {
  const store = await getStoreForUser(storeId);
  if (!store) return [];
  const user = await getCurrentUser();
  const supabase = isFounderEmail(user?.email) ? createSupabaseAdminClient() : createSupabaseServerClient();
  const { data } = await supabase
    .from("store_invitations")
    .select("*")
    .eq("store_id", storeId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });
  return (data ?? []) as StoreInvitation[];
}

export async function getStoresWithPendingBilling() {
  const stores = await getMyStores();
  return stores.filter((store) => ["past_due", "unpaid", "incomplete"].includes(store.billing_status));
}

export async function getActiveGraceCodes() {
  const user = await getCurrentUser();
  if (!isFounderEmail(user?.email)) return [];
  const supabase = createSupabaseAdminClient();
  const { data } = await supabase
    .from("billing_codes")
    .select("id, code, grace_days, active, expires_at, redemption_count, max_redemptions, created_at")
    .eq("kind", "grace")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(20);
  return data ?? [];
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
