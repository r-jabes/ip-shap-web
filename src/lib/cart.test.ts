import { describe, expect, it } from "vitest";
import {
  MAX_LINE_QUANTITY,
  cartItemCount,
  cartSubtotal,
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
});
