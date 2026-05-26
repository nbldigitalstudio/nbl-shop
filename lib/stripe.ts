import Stripe from "stripe";

export function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

export function platformFee(amountCents: number) {
  const feePercent = Number(process.env.STRIPE_PLATFORM_FEE_PERCENT ?? 1);
  return Math.round(amountCents * (feePercent / 100));
}
