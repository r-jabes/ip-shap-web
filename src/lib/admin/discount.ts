export const MAX_DISCOUNT_PERCENT = 90;

/**
 * `regular` is the normal price. Returns what customers pay (`price`) and, when
 * a discount applies, the regular price to show struck through (`compareAt`).
 */
export function applyDiscount(
  regular: number,
  percent: number,
): { price: number; compareAt: number | null } {
  if (!Number.isInteger(regular) || regular < 0) {
    throw new Error("Price must be a whole, non-negative RWF amount.");
  }
  if (!Number.isFinite(percent) || percent <= 0) {
    return { price: regular, compareAt: null };
  }
  const safePercent = Math.min(MAX_DISCOUNT_PERCENT, Math.round(percent));
  const price = Math.round((regular * (100 - safePercent)) / 100);
  if (price >= regular) return { price: regular, compareAt: null };
  return { price, compareAt: regular };
}

/** Percent off implied by a stored price pair (0 when not discounted). */
export function impliedDiscountPercent(
  price: number,
  compareAt: number | null | undefined,
): number {
  if (!compareAt || compareAt <= price) return 0;
  return Math.max(1, Math.round(((compareAt - price) / compareAt) * 100));
}

export function parseDiscountPercent(raw: string): number {
  const trimmed = raw.trim();
  if (trimmed === "") return 0;
  const value = Number(trimmed);
  if (!Number.isFinite(value) || value < 0 || value > MAX_DISCOUNT_PERCENT) {
    throw new Error(
      `Discount must be between 0 and ${MAX_DISCOUNT_PERCENT} percent.`,
    );
  }
  return Math.round(value);
}
