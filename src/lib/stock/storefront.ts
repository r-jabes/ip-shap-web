import type { ProductAvailability } from "@/domain/catalogue";
import { isCountedStock, LOW_STOCK_THRESHOLD } from "@/lib/stock/engine";

/** Hard cap on one cart line, independent of stock. Must match the server-side order validation. */
export const MAX_ORDER_LINE_QUANTITY = 99;

export type StockSnapshot = {
  availability: ProductAvailability;
  /** Null means the quantity is not tracked. */
  stockQuantity?: number | null;
};

export type StockTone = "out" | "low" | "in" | "untracked";

export type StockInfo = {
  tone: StockTone;
  /** Most units a shopper may put in one order line (0 = cannot order). */
  max: number;
  /** Short customer-facing text, e.g. "Only 3 left". Empty when nothing useful can be said. */
  label: string;
};

/** Most units of this product a shopper can order right now. */
export function maxOrderableQuantity(stock: StockSnapshot): number {
  if (stock.availability === "out_of_stock") return 0;
  if (
    isCountedStock({
      availability: stock.availability,
      quantity: stock.stockQuantity,
    })
  ) {
    return Math.min(
      MAX_ORDER_LINE_QUANTITY,
      Math.max(0, Math.floor(stock.stockQuantity as number)),
    );
  }
  return MAX_ORDER_LINE_QUANTITY;
}

/** Plain-English stock status shown on cards, product pages, the cart and checkout. */
export function describeStock(stock: StockSnapshot): StockInfo {
  const max = maxOrderableQuantity(stock);
  if (max === 0) return { tone: "out", max, label: "Out of stock" };

  const counted = isCountedStock({
    availability: stock.availability,
    quantity: stock.stockQuantity,
  });
  if (counted) {
    const onHand = stock.stockQuantity as number;
    return onHand <= LOW_STOCK_THRESHOLD
      ? { tone: "low", max, label: `Only ${onHand} left` }
      : { tone: "in", max, label: `${onHand} in stock` };
  }
  if (stock.availability === "low_stock") {
    return { tone: "low", max, label: "Low stock" };
  }
  if (stock.availability === "in_stock") {
    return { tone: "in", max, label: "In stock" };
  }
  return { tone: "untracked", max, label: "" };
}
