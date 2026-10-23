import { describe, expect, it } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";
import { isOrderableNow, selectRestocked } from "./back-in-stock";
import { buildBackInStockEmail } from "./templates/back-in-stock";
import type { RestockRequest } from "@/lib/stock/restock-requests";

function product(overrides: Partial<DemoProduct>): DemoProduct {
  return {
    id: "p1",
    slug: "red-wine",
    name: "Red Wine",
    status: "published",
    availability: "in_stock",
    stockQuantity: 5,
    ...overrides,
  } as DemoProduct;
}

function request(productId: string): RestockRequest {
  return {
    id: `r-${productId}`,
    productId,
    kind: "email",
    contact: "a@example.com",
    createdAt: "2026-10-01T00:00:00Z",
    notifiedAt: null,
  };
}

describe("back in stock", () => {
  it("treats sold-out, unpublished and zero-stock drinks as not orderable", () => {
    expect(isOrderableNow(product({}))).toBe(true);
    expect(isOrderableNow(product({ availability: "out_of_stock" }))).toBe(false);
    expect(isOrderableNow(product({ stockQuantity: 0 }))).toBe(false);
    expect(isOrderableNow(product({ status: "draft" }))).toBe(false);
  });

  it("only picks requests whose drink is orderable again", () => {
    const { ready } = selectRestocked(
      [request("p1"), request("p2"), request("missing")],
      [product({ id: "p1" }), product({ id: "p2", stockQuantity: 0 })],
    );
    expect(ready.map((entry) => entry.request.productId)).toEqual(["p1"]);
  });

  it("builds a branded customer email with a one-time footer", () => {
    const email = buildBackInStockEmail({
      productName: "Red Wine",
      productUrl: "https://example.com/product/red-wine",
      logoUrl: "cid:ipshap-logo",
      appUrl: "https://example.com",
    });
    expect(email.subject).toBe("Red Wine is back in stock");
    expect(email.html).toContain("https://example.com/product/red-wine");
    expect(email.html).not.toContain("admin account");
    expect(email.text).toContain("one-time email");
  });
});
