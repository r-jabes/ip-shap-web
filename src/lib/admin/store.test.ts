import { beforeEach, describe, expect, it } from "vitest";
import type { AdminSession } from "./session";
import {
  adminAdjustStock,
  adminDashboardCounts,
  adminGetProduct,
  adminListProducts,
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
    expect(counts.totalProducts).toBe(adminListProducts().length);
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
