import { timingSafeEqual } from "node:crypto";

/**
 * Constant-time string compare for lookup tokens.
 * Different lengths still do a dummy compare to reduce timing leakage.
 */
export function secureTokenEquals(expected: string, provided: string): boolean {
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(provided, "utf8");
  if (a.length !== b.length) {
    timingSafeEqual(a, a);
    return false;
  }
  return timingSafeEqual(a, b);
}
