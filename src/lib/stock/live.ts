import type { ProductAvailability } from "@/domain/catalogue";
import { adminGetProduct } from "@/lib/admin/store";
import { getProductById } from "@/lib/catalogue";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type LiveStockEntry = {
  availability: ProductAvailability;
  /** Null means the quantity is not tracked. */
  quantity: number | null;
};

const SELLABLE_STATUSES = new Set(["published", "demo"]);
const UNAVAILABLE: LiveStockEntry = {
  availability: "out_of_stock",
  quantity: 0,
};
export const MAX_LIVE_STOCK_IDS = 50;

/**
 * Current stock for the given products, read straight from the source of truth
 * (never the hour-long catalogue cache). Unknown or unpublished products are reported
 * as out of stock so a stale cart line can never be ordered.
 */
export async function getLiveStock(
  ids: string[],
): Promise<Record<string, LiveStockEntry>> {
  const unique = [...new Set(ids)].slice(0, MAX_LIVE_STOCK_IDS);
  const result: Record<string, LiveStockEntry> = {};
  if (unique.length === 0) return result;

  if (hasSupabaseServiceConfig()) {
    const client = getSupabaseServiceClient()!;
    const { data, error } = await client
      .from("products")
      .select(
        "id, status, availability, inventory_levels ( quantity, availability )",
      )
      .in("id", unique);
    if (error) throw new Error(error.message);
    for (const row of data ?? []) {
      const inventory = Array.isArray(row.inventory_levels)
        ? row.inventory_levels[0]
        : row.inventory_levels;
      result[row.id as string] = SELLABLE_STATUSES.has(row.status as string)
        ? {
            availability: (inventory?.availability ??
              row.availability ??
              "unknown") as ProductAvailability,
            quantity: inventory?.quantity ?? null,
          }
        : UNAVAILABLE;
    }
  } else {
    for (const id of unique) {
      const product = adminGetProduct(id) ?? getProductById(id);
      if (product && SELLABLE_STATUSES.has(product.status)) {
        result[id] = {
          availability: product.availability,
          quantity: product.stockQuantity ?? null,
        };
      }
    }
  }

  for (const id of unique) result[id] ??= UNAVAILABLE;
  return result;
}
