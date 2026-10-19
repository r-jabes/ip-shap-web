/** Sensible Rwanda-first phone validation; still allows +international. */

export function normalizePhone(input: string): string {
  return input.replace(/[\s()-]/g, "").trim();
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
