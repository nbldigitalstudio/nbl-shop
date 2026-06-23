import type Stripe from "stripe";

export type CheckoutDiscount =
  | { promotion_code: string; coupon?: never }
  | { coupon: string; promotion_code?: never };

const TWO_MONTH_PASS_CODE = "2MONTHPASS";

async function ensureTwoMonthPassCoupon(stripe: Stripe) {
  try {
    const existing = await stripe.coupons.retrieve(TWO_MONTH_PASS_CODE);
    if (existing && !("deleted" in existing) && existing.valid) {
      return existing.id;
    }
  } catch {
    // If it does not exist in the current Stripe mode, create the official
    // coupon once and let Stripe handle the discount from then on.
  }

  const coupon = await stripe.coupons.create({
    id: TWO_MONTH_PASS_CODE,
    name: "2 meses gratis",
    percent_off: 100,
    duration: "repeating",
    duration_in_months: 2
  });

  return coupon.id;
}

export async function resolveCheckoutDiscount(
  stripe: Stripe,
  code?: string | null
): Promise<CheckoutDiscount | null> {
  const normalizedCode = code?.trim();

  if (!normalizedCode) return null;

  if (normalizedCode.toUpperCase() === TWO_MONTH_PASS_CODE) {
    const couponId = await ensureTwoMonthPassCoupon(stripe);
    return { coupon: couponId };
  }

  const promotionCodes = await stripe.promotionCodes.list({
    code: normalizedCode,
    active: true,
    limit: 1,
  });

  const promotionCode = promotionCodes.data.find(
    (item) => item.active && item.coupon?.valid
  );

  if (promotionCode) {
    return { promotion_code: promotionCode.id };
  }

  try {
    const coupon = await stripe.coupons.retrieve(normalizedCode);

    // 🔥 FIX: Stripe coupon puede ser deleted o no existir
    if (coupon && !("deleted" in coupon) && coupon.valid) {
      return { coupon: coupon.id };
    }
  } catch {
    return null;
  }

  return null;
}
