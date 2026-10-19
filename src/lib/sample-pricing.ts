import type { MoneyRwf } from "@/lib/money";
import { moneyRwf } from "@/lib/money";

/**
 * Sample “was” price for sale UI review. Not a real discount — only used to
 * exercise strikethrough / % off presentation until admin pricing lands.
 */
export function sampleCompareAtPrice(price: MoneyRwf): MoneyRwf | undefined {
  if (price.amount < 20_000) return undefined;
  const was = Math.round((price.amount * 1.18) / 1000) * 1000;
  if (was <= price.amount) return undefined;
  return moneyRwf(was);
}

export function sampleDiscountPercent(
  price: MoneyRwf,
  compareAt: MoneyRwf,
): number {
  return Math.max(
    1,
    Math.round(((compareAt.amount - price.amount) / compareAt.amount) * 100),
  );
}
