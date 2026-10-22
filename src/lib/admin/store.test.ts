import { beforeEach, describe, expect, it } from "vitest";
import type { AdminSession } from "./session";
import {
  adminAdjustStock,
  adminDashboardCounts,
  adminGetProduct,
  adminListProducts,
  adminSetDiscount,
  adminUpsertProduct,
} from "./store";

const actor: AdminSession = {
  sub: "test",
  email: "owner@example.com",
  role: "owner",
  exp: Math.floor(Date.now() / 1000) + 3600,
};

describe("admin store", () => {
  beforeEach(() => {
    globalThis.__ipShapAdminStore = undefined;
  });

  it("exposes dashboard counts from real store data", () => {
    const counts = adminDashboardCounts();
    expect(counts.totalProducts + counts.archived).toBe(
      adminListProducts().length,
    );
  });

  it("applies and clears discounts without losing the regular price", () => {
    const created = adminUpsertProduct(actor, {
      slug: "discount-test",
      name: "Discount Test",
      description: "",
      priceAmount: 20000,
      discountPercent: 15,
      brandSlug: "b",
      brandName: "B",
      status: "draft",
      availability: "unknown",
      isProvisional: false,
      stockQuantity: null,
    });
    expect(created.price.amount).toBe(17000);
    expect(created.compareAtPrice?.amount).toBe(20000);

    const cleared = adminSetDiscount(actor, created.id, 0);
    expect(cleared.price.amount).toBe(20000);
    expect(cleared.compareAtPrice).toBeUndefined();
  });

  it("creates a draft product with integer RWF", () => {
    const created = adminUpsertProduct(actor, {
      slug: "admin-test-sku",
      name: "Admin Test SKU",
      description: "Created in test",
      priceAmount: 9900,
      brandSlug: "test-brand",
      brandName: "Test Brand",
      status: "draft",
      availability: "unknown",
      isProvisional: true,
      stockQuantity: null,
    });
    expect(created.price.amount).toBe(9900);
    expect(adminGetProduct(created.id)?.slug).toBe("admin-test-sku");
  });

  it("records stock adjustments and rejects negatives", () => {
    const product = adminListProducts()[0]!;
    const record = adminAdjustStock(actor, {
      productId: product.id,
      newQuantity: 4,
      newAvailability: "in_stock",
      reason: "Delivery received",
      expectedQuantity: product.stockQuantity ?? null,
    });
    expect(record.newQuantity).toBe(4);
    expect(() =>
      adminAdjustStock(actor, {
        productId: product.id,
        newQuantity: -2,
        newAvailability: "in_stock",
        reason: "bad",
      }),
    ).toThrow(/Negative/);
  });
});
