import { formatRwf } from "@/lib/money";

export type ManualPaymentInput = {
  /** Integer RWF actually received. May differ from the order total. */
  amount: number;
  /** Receipt or transaction number, if there is one. */
  reference?: string;
  /** Free-text note, e.g. "MTN MoMo" or "10% loyalty discount". */
  note?: string;
  actorLabel: string;
};

export const MAX_MANUAL_PAYMENT_RWF = 1_000_000_000;

export const INVALID_PAYMENT_AMOUNT_MESSAGE =
  "Enter the amount received as a whole number above zero.";

export function isValidPaymentAmount(amount: number): boolean {
  return (
    Number.isInteger(amount) && amount > 0 && amount <= MAX_MANUAL_PAYMENT_RWF
  );
}

export function assertValidPaymentAmount(amount: number): void {
  if (!isValidPaymentAmount(amount)) {
    throw new Error(INVALID_PAYMENT_AMOUNT_MESSAGE);
  }
}

/** One readable line for the order history. Reference and note are optional. */
export function describeManualPayment(input: ManualPaymentInput): string {
  const reference = input.reference?.trim();
  const note = input.note?.trim();
  return (
    `Payment of ${formatRwf(input.amount)} recorded` +
    (reference ? ` (ref ${reference})` : "") +
    (note ? `: ${note}` : "") +
    ` · ${input.actorLabel}`
  );
}
