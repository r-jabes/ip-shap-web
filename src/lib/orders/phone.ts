/** Sensible Rwanda-first phone validation; still allows +international. */

export function normalizePhone(input: string): string {
  return input.replace(/[\s()-]/g, "").trim();
}

/**
 * True when two numbers are the same line however they were typed (`0788 123 456`,
 * `+250 788 123 456`, `250788123456`): compares the last nine digits.
 */
export function phonesMatch(a: string, b: string): boolean {
  const digits = (value: string) => value.replace(/\D/g, "");
  const left = digits(a);
  const right = digits(b);
  if (left.length < 9 || right.length < 9) return false;
  return left.slice(-9) === right.slice(-9);
}

export function isValidCheckoutPhone(input: string): boolean {
  const normalized = normalizePhone(input);
  if (!/^\+?[0-9]{9,15}$/.test(normalized)) return false;
  if (normalized.startsWith("+250") || normalized.startsWith("250")) {
    const national = normalized.replace(/^\+?250/, "");
    return /^7[2-9]\d{7}$/.test(national);
  }
  if (normalized.startsWith("07")) {
    return /^07[2-9]\d{7}$/.test(normalized);
  }
  return normalized.startsWith("+");
}
