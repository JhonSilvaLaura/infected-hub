/** Share the platform keeps from each sale. Shown to creators before they set a price. */
export const PLATFORM_FEE_RATE = 0.2;

/** Splits a price in cents into the platform fee and what the creator receives. */
export function splitSale(priceCents: number) {
  const fee = Math.round(priceCents * PLATFORM_FEE_RATE);
  return { gross: priceCents, fee, net: priceCents - fee };
}
