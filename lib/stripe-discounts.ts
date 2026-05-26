import type Stripe from "stripe";

export type CheckoutDiscount =
  | { promotion_code: string; coupon?: never }
  | { coupon: string; promotion_code?: never };

export async function resolveCheckoutDiscount(stripe: Stripe, code?: string | null): Promise<CheckoutDiscount | null> {
  const normalizedCode = code?.trim();

  if (!normalizedCode) {
    return null;
  }

  const promotionCodes = await stripe.promotionCodes.list({
    code: normalizedCode,
    active: true,
    limit: 1
  });

  const promotionCode = promotionCodes.data.find((item) => item.active && item.coupon.valid);

  if (promotionCode) {
    return { promotion_code: promotionCode.id };
  }

  try {
    const coupon = await stripe.coupons.retrieve(normalizedCode);

    if (!coupon.deleted && coupon.valid) {
      return { coupon: coupon.id };
    }
  } catch {
    return null;
  }

  return null;
}
