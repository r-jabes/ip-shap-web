import { z } from "zod";
import type { CartLine, DemoProduct } from "@/domain/catalogue";

/**
 * Pure cart helpers (no React, no storage side effects) so the rules are unit-testable.
 *
 * Root cause of the "badge says 3, drawer says empty" bug: the badge summed every stored line
 * while the drawer only rendered lines whose product still existed. Now there is one derived
 * list (`resolveCart`) and the count, drawer, cart page and checkout all read from it.
 */

/** Bump when the stored shape changes; old keys are discarded on load. */
export const CART_STORAGE_KEY = "ip-shap-cart-v2";
export const LEGACY_CART_KEYS = ["ip-shap-demo-cart"] as const;
export const MAX_LINE_QUANTITY = 99;

const storedLineSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().positive(),
});
const storedCartSchema = z.array(z.unknown());

export type CartItem = {
  productId: string;
  quantity: number;
  product: DemoProduct;
};

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(quantity)));
}

/** Parses untrusted localStorage content. Invalid lines are dropped; duplicates are merged. */
export function parseStoredCart(raw: string | null): CartLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const list = storedCartSchema.safeParse(data);
  if (!list.success) return [];

  const merged = new Map<string, number>();
  for (const entry of list.data) {
    const line = storedLineSchema.safeParse(entry);
    if (!line.success) continue;
    const { productId, quantity } = line.data;
    merged.set(
      productId,
      clampQuantity((merged.get(productId) ?? 0) + quantity),
    );
  }
  return Array.from(merged, ([productId, quantity]) => ({
    productId,
    quantity,
  }));
}

/** Joins lines with live product data. Lines whose product cannot be resolved are reported, not shown. */
export function resolveCart(
  lines: CartLine[],
  getProduct: (id: string) => DemoProduct | undefined,
): { items: CartItem[]; removed: CartLine[] } {
  const items: CartItem[] = [];
  const removed: CartLine[] = [];
  for (const line of lines) {
    const product = getProduct(line.productId);
    if (!product) {
      removed.push(line);
      continue;
    }
    items.push({
      productId: line.productId,
      quantity: clampQuantity(line.quantity),
      product,
    });
  }
  return { items, removed };
}

export function cartItemCount(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => sum + item.product.price.amount * item.quantity,
    0,
  );
}
