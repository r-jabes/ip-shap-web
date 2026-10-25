import { randomBytes } from "node:crypto";

/**
 * Opaque commercial document identifiers (orders, quotations, invoices).
 *
 * Design (international practice for public refs):
 * - Cryptographically secure random (Node `crypto.randomBytes`) — not a counter
 * - Crockford Base32 (RFC-friendly alphabet; no I/L/O/U) for human transcription
 * - Type prefix only — no year/serial that reveals volume (`2026-0001` forbidden)
 * - Internal DB primary keys stay UUID; these are the customer-facing codes
 *
 * Entropy: 10 bytes ≈ 80 bits per id (collision-resistant at retail volumes).
 */

/** Crockford Base32 — https://www.crockford.com/base32.html */
const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";

export type DocumentKind = "order" | "quotation" | "invoice";

const PREFIX: Record<DocumentKind, string> = {
  order: "IPS",
  quotation: "QT",
  invoice: "INV",
};

/** Matches generated ids, e.g. IPS-7K9M2X4QH3N6P8R0 */
export const DOCUMENT_ID_PATTERN =
  /^(IPS|QT|INV)-[0-9A-HJKMNP-TV-Z]{16}$/;

export function encodeCrockford(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      bits -= 5;
      out += CROCKFORD[(value >>> bits) & 31];
    }
  }
  if (bits > 0) {
    out += CROCKFORD[(value << (5 - bits)) & 31];
  }
  return out;
}

/**
 * Create a public document reference. Never encode sequence or day-count.
 */
export function createDocumentId(kind: DocumentKind): string {
  const body = encodeCrockford(randomBytes(10));
  return `${PREFIX[kind]}-${body}`;
}

export function isDocumentId(
  value: string,
  kind?: DocumentKind,
): boolean {
  if (!DOCUMENT_ID_PATTERN.test(value)) return false;
  if (!kind) return true;
  return value.startsWith(`${PREFIX[kind]}-`);
}
