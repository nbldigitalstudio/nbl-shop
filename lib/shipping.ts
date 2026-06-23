export const SHIPPING_TIERS = [
  { minCents: 0, maxCents: 4999, shippingCents: 700 },
  { minCents: 5000, maxCents: 9999, shippingCents: 900 },
  { minCents: 10000, maxCents: Number.POSITIVE_INFINITY, shippingCents: 1500 },
] as const;

function positiveNumberFromEnv(key: string, fallback: number) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export function calculateShippingAmountCents(subtotalCents: number) {
  const tier = SHIPPING_TIERS.find(
    (candidate) =>
      subtotalCents >= candidate.minCents && subtotalCents <= candidate.maxCents
  );

  return tier?.shippingCents ?? 1500;
}

export function calculateOrderTotalCents(subtotalCents: number) {
  return subtotalCents + calculateShippingAmountCents(subtotalCents);
}

export function getPirateShipDefaultPackage() {
  return {
    weightOz: positiveNumberFromEnv("PIRATE_SHIP_DEFAULT_WEIGHT_OZ", 8),
    length: positiveNumberFromEnv("PIRATE_SHIP_DEFAULT_LENGTH", 8),
    width: positiveNumberFromEnv("PIRATE_SHIP_DEFAULT_WIDTH", 6),
    height: positiveNumberFromEnv("PIRATE_SHIP_DEFAULT_HEIGHT", 2),
  };
}
