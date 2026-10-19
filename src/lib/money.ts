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
  return moneyRwf(a.amount + b.amount);
}
