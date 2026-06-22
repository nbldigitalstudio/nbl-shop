import type { BillingInterval, Plan } from "@/lib/types";

export type AccessPlan = Plan | "founder";

export const PLANS: Record<
  Plan,
  {
    name: string;
    monthlyPriceCents: number;
    annualPriceCents: number;
    annualSavingsCents: number;
    maxProducts: number;
    feePercent: number;
    features: string[];
    stripePrices: Record<BillingInterval, string>;
  }
> = {
  basic: {
    name: "Basic",
    monthlyPriceCents: 1000,
    annualPriceCents: 10000,
    annualSavingsCents: 2000,
    maxProducts: 500,
    feePercent: 5,
    stripePrices: {
      month: "STRIPE_BASIC_MONTHLY_PRICE_ID",
      year: "STRIPE_BASIC_YEARLY_PRICE_ID"
    },
    features: [
      "Hasta 500 productos",
      "Productos, órdenes y tienda",
      "Checkout y pagos",
      "Configuración básica"
    ]
  },
  pro: {
    name: "Pro",
    monthlyPriceCents: 3000,
    annualPriceCents: 25000,
    annualSavingsCents: 11000,
    maxProducts: -1,
    feePercent: 2,
    stripePrices: {
      month: "STRIPE_PRO_MONTHLY_PRICE_ID",
      year: "STRIPE_PRO_YEARLY_PRICE_ID"
    },
    features: ["Productos ilimitados", "Acceso completo", "Comisión reducida de 2%"]
  }
};

export const plans = (Object.keys(PLANS) as Plan[]).map((id) => ({ id, ...PLANS[id] }));

export function getStripePriceId(plan: Plan, interval: BillingInterval) {
  return process.env[PLANS[plan].stripePrices[interval]];
}

export function getPlanFeePercent(plan: Plan) {
  return PLANS[plan].feePercent;
}

export function normalizePlan(value?: string | null): Plan {
  return value === "pro" ? "pro" : "basic";
}

export function canAddProduct(plan: AccessPlan, currentProductCount: number) {
  if (plan === "founder") return true;
  const maxProducts = PLANS[plan].maxProducts;
  return maxProducts < 0 || currentProductCount < maxProducts;
}
