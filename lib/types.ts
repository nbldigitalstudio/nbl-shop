export type Plan = "starter" | "business" | "pro";
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
  stripe_account_id: string | null;
  stripe_charges_enabled: boolean;
  stripe_payouts_enabled: boolean;
  stripe_details_submitted: boolean;
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
  amount_total_cents: number;
  application_fee_cents: number;
  status: OrderStatus;
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

export type Subscription = {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: Plan;
  status: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export type DashboardMetrics = {
  revenueCents: number;
  orderCount: number;
  productCount: number;
  averageOrderCents: number;
};
