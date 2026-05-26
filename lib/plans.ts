import type { Plan } from "@/lib/types";

export type AccessPlan = Plan | "founder";

export const PLANS: Record<
  Plan,
  {
    price: number;
    trialDays?: number;
    maxProducts: number;
  }
> = {
  starter: {
    price: 19.99,
    trialDays: 60,
    maxProducts: 500
  },
  business: {
    price: 39.99,
    maxProducts: -1
  },
  pro: {
    price: 79.99,
    maxProducts: -1
  }
};

export const plans: Array<{
  id: Plan;
  name: string;
  price: string;
  trial: string;
  maxProducts: number;
  stripeEnv: string;
  features: string[];
}> = [
  {
    id: "starter",
    name: "Starter",
    price: `$${PLANS.starter.price.toFixed(2)}`,
    trial: `${PLANS.starter.trialDays} days free trial`,
    maxProducts: PLANS.starter.maxProducts,
    stripeEnv: "STRIPE_STARTER_PRICE_ID",
    features: ["1 storefront", "Up to 500 products", "Stripe Connect payouts"]
  },
  {
    id: "business",
    name: "Business",
    price: `$${PLANS.business.price.toFixed(2)}`,
    trial: "For growing teams",
    maxProducts: PLANS.business.maxProducts,
    stripeEnv: "STRIPE_BUSINESS_PRICE_ID",
    features: ["Unlimited products", "Advanced analytics", "Priority support"]
  },
  {
    id: "pro",
    name: "Pro",
    price: `$${PLANS.pro.price.toFixed(2)}`,
    trial: "For scaled sellers",
    maxProducts: PLANS.pro.maxProducts,
    stripeEnv: "STRIPE_PRO_PRICE_ID",
    features: ["Unlimited products", "Multiple team seats", "Launch support"]
  }
];

export function getStripePriceId(plan: Plan) {
  const selected = plans.find((item) => item.id === plan);
  return selected ? process.env[selected.stripeEnv] : undefined;
}

export function canAddProduct(plan: AccessPlan, currentProductCount: number) {
  if (plan === "founder") {
    return true;
  }

  const maxProducts = PLANS[plan].maxProducts;
  return maxProducts < 0 || currentProductCount < maxProducts;
}
