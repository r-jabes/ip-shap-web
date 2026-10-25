import { describe, expect, it } from "vitest";
import {
  MAX_LINE_QUANTITY,
  cartHasUnavailable,
  cartItemCount,
  cartSubtotal,
  cartSummaryLabel,
  clampQuantity,
  parseStoredCart,
  resolveCart,
} from "@/lib/cart";
import { getProductById, listProducts } from "@/lib/catalogue";

describe("clampQuantity", () => {
  it("keeps quantities between 1 and the maximum", () => {
    expect(clampQuantity(0)).toBe(1);
    expect(clampQuantity(-4)).toBe(1);
    expect(clampQuantity(2.9)).toBe(2);
    expect(clampQuantity(5000)).toBe(MAX_LINE_QUANTITY);
    expect(clampQuantity(Number.NaN)).toBe(1);
  });
});

describe("parseStoredCart", () => {
  it("returns an empty cart for missing or malformed data", () => {
    expect(parseStoredCart(null)).toEqual([]);
    expect(parseStoredCart("not json")).toEqual([]);
    expect(parseStoredCart('{"a":1}')).toEqual([]);
  });

  it("drops invalid lines and merges duplicates", () => {
    const raw = JSON.stringify([
      { productId: "a", quantity: 2 },
      { productId: "a", quantity: 3 },
      { productId: "b", quantity: -1 },
      { productId: "", quantity: 1 },
      { productId: "c", quantity: 1.5 },
      "junk",
    ]);
    expect(parseStoredCart(raw)).toEqual([{ productId: "a", quantity: 5 }]);
  });
});

describe("resolveCart", () => {
  const [first, second] = listProducts();

  it("separates resolvable lines from stale ones", () => {
    const { items, removed } = resolveCart(
      [
        { productId: first.id, quantity: 2 },
        { productId: "gone", quantity: 1 },
        { productId: second.id, quantity: 1 },
      ],
      getProductById,
    );
    expect(items.map((item) => item.productId)).toEqual([first.id, second.id]);
    expect(removed).toEqual([{ productId: "gone", quantity: 1 }]);
  });

  it("counts and totals only resolved items (badge always matches the drawer)", () => {
    const { items } = resolveCart(
      [
        { productId: first.id, quantity: 2 },
        { productId: "gone", quantity: 7 },
      ],
      getProductById,
    );
    expect(cartItemCount(items)).toBe(2);
    expect(cartSubtotal(items)).toBe(first.price.amount * 2);
  });

  it("caps a line at the units in stock", () => {
    const limited = { ...first, availability: "in_stock" as const, stockQuantity: 3 };
    const { items } = resolveCart(
      [{ productId: first.id, quantity: 19 }],
      () => limited,
    );
    expect(items[0]?.quantity).toBe(3);
    expect(items[0]?.stock.label).toBe("Only 3 left");
    expect(items[0]?.unavailable).toBe(false);
  });

  it("keeps out-of-stock lines visible but leaves them out of totals", () => {
    const soldOut = {
      ...first,
      availability: "out_of_stock" as const,
      stockQuantity: 0,
    };
    const { items } = resolveCart(
      [{ productId: first.id, quantity: 4 }],
      () => soldOut,
    );
    expect(items).toHaveLength(1);
    expect(items[0]?.unavailable).toBe(true);
    expect(cartHasUnavailable(items)).toBe(true);
    expect(cartItemCount(items)).toBe(0);
    expect(cartSubtotal(items)).toBe(0);
  });
});

describe("cartSummaryLabel", () => {
  it("separates products from units", () => {
    expect(cartSummaryLabel(1, 1)).toBe("1 product");
    expect(cartSummaryLabel(1, 19)).toBe("1 product · 19 units");
    expect(cartSummaryLabel(3, 3)).toBe("3 products");
    expect(cartSummaryLabel(2, 5)).toBe("2 products · 5 units");
  });
});
