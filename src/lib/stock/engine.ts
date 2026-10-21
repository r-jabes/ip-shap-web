import type { ProductAvailability } from "@/domain/catalogue";

/** Units at or below this count surface on the low-stock dashboard. */
export const LOW_STOCK_THRESHOLD = 5;

/**
 * Unknown availability must never be treated as sellable counted stock.
 * Counted stock requires a non-null non-negative quantity and a known availability.
 */
export function isCountedStock(input: {
  availability: ProductAvailability;
  quantity: number | null | undefined;
}): boolean {
  if (input.availability === "unknown") return false;
  return typeof input.quantity === "number" && input.quantity >= 0;
}

export function assertNonNegativeStock(quantity: number | null): void {
  if (quantity !== null && quantity < 0) {
    throw new Error("Negative stock is not allowed");
  }
}

export function availabilityAfterDecrement(
  previous: ProductAvailability,
  newQuantity: number,
): ProductAvailability {
  if (newQuantity === 0) return "out_of_stock";
  if (newQuantity <= LOW_STOCK_THRESHOLD) return "low_stock";
  return previous === "out_of_stock" || previous === "low_stock"
    ? "in_stock"
    : previous;
}

export function availabilityAfterRestore(
  previous: ProductAvailability,
  newQuantity: number,
): ProductAvailability {
  if (newQuantity <= 0) return "out_of_stock";
  if (newQuantity <= LOW_STOCK_THRESHOLD) {
    return previous === "out_of_stock" ? "low_stock" : previous === "unknown" ? "low_stock" : previous;
  }
  if (previous === "out_of_stock" || previous === "low_stock") return "in_stock";
  return previous;
}

export function isLowStockItem(input: {
  availability: ProductAvailability;
  quantity: number | null | undefined;
}): boolean {
  if (input.availability === "low_stock") return true;
  if (!isCountedStock(input)) return false;
  return (input.quantity as number) > 0 && (input.quantity as number) <= LOW_STOCK_THRESHOLD;
}
