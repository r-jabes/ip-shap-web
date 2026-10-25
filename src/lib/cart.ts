import { z } from "zod";
import type { CartLine, DemoProduct } from "@/domain/catalogue";
import {
  MAX_ORDER_LINE_QUANTITY,
  describeStock,
  type StockInfo,
} from "@/lib/stock/storefront";

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
/**
 * Small saved copy of each cart product (name, price, one photo) so the cart shows instantly
 * on the next visit without sending the whole catalogue to the browser.
 */
export const CART_PRODUCTS_STORAGE_KEY = "ip-shap-cart-products-v1";
export const MAX_LINE_QUANTITY = MAX_ORDER_LINE_QUANTITY;

const storedLineSchema = z.object({
  productId: z.string().min(1).max(64),
  quantity: z.number().int().positive(),
});
const storedCartSchema = z.array(z.unknown());

export type CartItem = {
  productId: string;
  /** Never above what is in stock (unless the line is unavailable, where it is kept for display). */
  quantity: number;
  product: DemoProduct;
  stock: StockInfo;
  /** True when the product cannot be ordered right now (out of stock). */
  unavailable: boolean;
};

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_LINE_QUANTITY, Math.max(1, Math.floor(quantity)));
}

/** The part of a product the cart needs, kept small for local storage. */
export function snapshotProduct(product: DemoProduct): DemoProduct {
  return {
    ...product,
    description: "",
    internalNotes: undefined,
    images: product.images.slice(0, 1).map((image) => ({
      id: image.id,
      role: image.role,
      src: image.src,
      alt: image.alt,
      width: image.width,
      height: image.height,
      sortOrder: image.sortOrder,
      processingStatus: image.processingStatus,
    })),
  };
}

const storedProductSchema = z.object({
  id: z.string().min(1).max(64),
  slug: z.string().min(1).max(200),
  name: z.string().min(1).max(300),
  price: z.object({
    amount: z.number().int().nonnegative(),
    currency: z.literal("RWF"),
  }),
  images: z.array(z.unknown()).default([]),
  availability: z
    .enum(["in_stock", "low_stock", "out_of_stock", "unknown"])
    .default("unknown"),
});

/** Parses saved product copies from untrusted storage. Anything malformed is skipped. */
export function parseStoredProducts(raw: string | null): DemoProduct[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const products: DemoProduct[] = [];
  for (const entry of data) {
    const parsed = storedProductSchema.safeParse(entry);
    if (!parsed.success) continue;
    // Validated for the fields the cart relies on; the rest is the shape we saved ourselves.
    products.push({
      ...(entry as DemoProduct),
      description: "",
      status: "published",
      isProvisional: false,
      brandSlug: (entry as DemoProduct).brandSlug ?? "",
      brandName: (entry as DemoProduct).brandName ?? "",
      demoLabel: "",
    });
  }
  return products;
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
    const stock = describeStock(product);
    const wanted = clampQuantity(line.quantity);
    items.push({
      productId: line.productId,
      quantity: stock.max > 0 ? Math.min(wanted, stock.max) : wanted,
      product,
      stock,
      unavailable: stock.max === 0,
    });
  }
  return { items, removed };
}

/** Units that can actually be ordered (unavailable lines are excluded). */
export function cartItemCount(items: CartItem[]): number {
  return items.reduce(
    (sum, item) => (item.unavailable ? sum : sum + item.quantity),
    0,
  );
}

/** Distinct products in the cart. This is what the header badge shows. */
export function cartProductCount(items: CartItem[]): number {
  return items.length;
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce(
    (sum, item) =>
      item.unavailable ? sum : sum + item.product.price.amount * item.quantity,
    0,
  );
}

export function cartHasUnavailable(items: CartItem[]): boolean {
  return items.some((item) => item.unavailable);
}

/**
 * Standard storefront wording: products and units are different things.
 * "1 product" when each product is added once, "1 product · 19 units" otherwise.
 */
export function cartSummaryLabel(products: number, units: number): string {
  const productText = `${products} ${products === 1 ? "product" : "products"}`;
  if (units === products || units === 0) return productText;
  return `${productText} · ${units} ${units === 1 ? "unit" : "units"}`;
}
