/**
 * Money is always stored and calculated as integer Rwandan Francs (RWF).
 * Never use floating-point arithmetic for monetary values.
 */

export const CURRENCY_RWF = "RWF" as const;

export type MoneyRwf = {
  readonly amount: number;
  readonly currency: typeof CURRENCY_RWF;
};

export function moneyRwf(amount: number): MoneyRwf {
  if (!Number.isInteger(amount)) {
    throw new Error("RWF amounts must be integers.");
  }
  if (amount < 0) {
    throw new Error("RWF amounts must be non-negative.");
  }
  return { amount, currency: CURRENCY_RWF };
}

export function formatRwf(amount: number, locale = "en-RW"): string {
  if (!Number.isInteger(amount)) {
    throw new Error("RWF amounts must be integers.");
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: CURRENCY_RWF,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function addMoney(a: MoneyRwf, b: MoneyRwf): MoneyRwf {
  return moneyRwf(checkedSum(a.amount, b.amount));
}

/** Line total = unit × qty; both must be safe integers. */
export function multiplyMoney(unit: MoneyRwf, quantity: number): MoneyRwf {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error("Quantity must be a non-negative integer.");
  }
  if (quantity === 0) return moneyRwf(0);
  if (
    unit.amount > 0 &&
    quantity > Math.floor(Number.MAX_SAFE_INTEGER / unit.amount)
  ) {
    throw new Error("Money overflow.");
  }
  return moneyRwf(unit.amount * quantity);
}

export function subtractMoney(a: MoneyRwf, b: MoneyRwf): MoneyRwf {
  if (b.amount > a.amount) {
    throw new Error("Cannot subtract to a negative RWF amount.");
  }
  return moneyRwf(a.amount - b.amount);
}

function checkedSum(a: number, b: number): number {
  const sum = a + b;
  if (!Number.isSafeInteger(sum)) {
    throw new Error("Money overflow.");
  }
  return sum;
}
