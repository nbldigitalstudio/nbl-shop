export type Plan = "basic" | "pro";
export type BillingInterval = "month" | "year";
export type OrderStatus = "pending" | "paid" | "fulfilled" | "refunded";
export type StoreRole = "owner" | "admin" | "staff";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Store = {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  banner_url: string | null;
  theme_color: string;
  description: string | null;
  category: string | null;
  owner_name: string | null;
  owner_email: string | null;
  owner_phone: string | null;
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  stripe_details_submitted: boolean;
  plan: Plan;
  billing_status: string;
  billing_grace_until: string | null;
  billing_interval: BillingInterval;
  theme_settings: Record<string, unknown>;
  social_links: Record<string, string>;
  contact_info: Record<string, string>;
  categories: string[];
  created_at: string;
  updated_at: string;
};

export type StoreMember = {
  id: string;
  store_id: string;
  user_id: string;
  role: StoreRole;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  name: string;
  price_cents: number;
  image_url: string | null;
  description: string | null;
  stock: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  store_id: string;
  stripe_checkout_session_id: string | null;
  customer_email: string | null;
  subtotal_cents: number;
  shipping_amount_cents: number;
  amount_total_cents: number;
  application_fee_cents: number;
  status: OrderStatus;
  payment_status: string;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_zip: string | null;
  shipping_country: string | null;
  shipping_status: string;
  tracking_number: string | null;
  shipping_carrier: string | null;
  shipping_service: string | null;
  shipping_label_url: string | null;
  shipped_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  unit_amount_cents: number;
  created_at: string;
};

export type OrderStoreSummary = Pick<Store, "id" | "name" | "slug">;

export type OrderItemWithProduct = OrderItem & {
  products: Pick<Product, "name" | "image_url"> | null;
};

export type OrderWithStore = Order & {
  stores: OrderStoreSummary;
};

export type OrderDetails = OrderWithStore & {
  order_items: OrderItemWithProduct[];
};

export type Subscription = {
  id: string;
  user_id: string;
  store_id: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  billing_interval: BillingInterval;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type StoreInvitation = {
  id: string;
  store_id: string;
  email: string;
  role: StoreRole;
  status: "pending" | "accepted" | "revoked";
  invited_by: string;
  created_at: string;
  accepted_at: string | null;
};

export type StoreMemberWithProfile = StoreMember & {
  profiles: Pick<Profile, "email" | "full_name"> | null;
};

export type DashboardMetrics = {
  revenueCents: number;
  orderCount: number;
  productCount: number;
  averageOrderCents: number;
};
