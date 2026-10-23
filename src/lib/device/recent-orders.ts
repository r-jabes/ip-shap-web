/**
 * Orders this device has placed or looked up, kept in the browser so a shopper can come back to
 * them without typing the reference and private token again. Nothing is stored on the server.
 */

export const ORDERS_STORAGE_KEY = "ip-shap-orders-v1";
export const MAX_REMEMBERED_ORDERS = 5;

export type RememberedOrder = {
  reference: string;
  /** The private lookup token from the confirmation link. */
  token: string;
  placedAt: string;
  totalRwf: number;
};

const REFERENCE_PATTERN = /^[A-Za-z0-9-]{3,40}$/;
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{6,200}$/;

function isRememberedOrder(value: unknown): value is RememberedOrder {
  if (!value || typeof value !== "object") return false;
  const order = value as Record<string, unknown>;
  return (
    typeof order.reference === "string" &&
    REFERENCE_PATTERN.test(order.reference) &&
    typeof order.token === "string" &&
    TOKEN_PATTERN.test(order.token) &&
    typeof order.placedAt === "string" &&
    Number.isFinite(Date.parse(order.placedAt)) &&
    typeof order.totalRwf === "number" &&
    Number.isFinite(order.totalRwf)
  );
}

/** Newest first. Anything malformed is ignored. */
export function parseRememberedOrders(raw: string | null): RememberedOrder[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isRememberedOrder)
      .slice(0, MAX_REMEMBERED_ORDERS)
      .map(({ reference, token, placedAt, totalRwf }) => ({
        reference,
        token,
        placedAt,
        totalRwf,
      }));
  } catch {
    return [];
  }
}

/** Adds or refreshes one order at the front and keeps only the newest few. */
export function rememberOrder(
  list: RememberedOrder[],
  order: RememberedOrder,
): RememberedOrder[] {
  if (!isRememberedOrder(order)) return list;
  return [
    order,
    ...list.filter((entry) => entry.reference !== order.reference),
  ].slice(0, MAX_REMEMBERED_ORDERS);
}

export function forgetOrder(
  list: RememberedOrder[],
  reference: string,
): RememberedOrder[] {
  return list.filter((entry) => entry.reference !== reference);
}
