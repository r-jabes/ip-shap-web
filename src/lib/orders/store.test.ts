import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PRODUCTS } from "@/fixtures/demo/catalogue";

describe("createOrder", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    globalThis.__ipShapOrderStore = undefined;
    globalThis.__ipShapAdminStore = undefined;
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("ONLINE_PAYMENT_ENABLED", "false");
    vi.stubEnv("NODE_ENV", "test");
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
  });

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("ignores client prices and snapshots authoritative amounts", async () => {
    const { createOrder } = await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    const order = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 2 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111101",
    });
    expect(order.subtotal.amount).toBe(product.price.amount * 2);
    expect(order.items[0]?.unitPrice.amount).toBe(product.price.amount);
    expect(order.paymentStatus).toBe("not_applicable");
    expect(order.fulfilmentStatus).toBe("awaiting_confirmation");
  });

  it("returns the same order for duplicate idempotency keys", async () => {
    const { createOrder } = await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    const key = "11111111-1111-4111-8111-111111111102";
    const first = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: key,
    });
    const second = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: key,
    });
    expect(second.id).toBe(first.id);
    expect(second.reference).toBe(first.reference);
  });

  it("rejects online payment when provider is not enabled", async () => {
    const { createOrder } = await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    expect(() =>
      createOrder({
        channel: "online_payment",
        items: [{ productId: product.id, quantity: 1 }],
        customerName: "Ada",
        customerPhone: "+250788123456",
        idempotencyKey: "11111111-1111-4111-8111-111111111103",
      }),
    ).toThrow(/Online payment is not available/);
  });

  it("requires lookup token pair for private retrieval", async () => {
    const { createOrder, lookupOrder } = await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    const order = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111104",
    });
    expect(lookupOrder(order.reference, "wrong-token")).toBeUndefined();
    expect(lookupOrder(order.reference, order.lookupToken)?.id).toBe(order.id);
  });

  it("records manual payment only with reference and reason", async () => {
    const { createOrder, markManualPayment } = await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    const order = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111105",
    });
    expect(() =>
      markManualPayment(order.id, {
        reference: "",
        reason: "bank",
        actorLabel: "staff@example.com",
      }),
    ).toThrow(/reference/i);
    const paid = markManualPayment(order.id, {
      reference: "MOMO-99",
      reason: "Verified MoMo slip",
      actorLabel: "staff@example.com",
    });
    expect(paid.paymentStatus).toBe("paid");
    expect(() =>
      markManualPayment(order.id, {
        reference: "MOMO-100",
        reason: "again",
        actorLabel: "staff@example.com",
      }),
    ).toThrow(/already marked paid/i);
  });

  it("fails concurrent reservations that would oversell known stock", async () => {
    const { adminUpsertProduct } = await import("@/lib/admin/store");
    const { createOrder } = await import("./store");
    const product = adminUpsertProduct(
      {
        sub: "test",
        email: "owner@example.com",
        role: "owner",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      {
        slug: `reserve-test-${Date.now()}`,
        name: "Reserve Test",
        description: "Stock reservation test",
        priceAmount: 5000,
        brandSlug: "test-brand",
        brandName: "Test Brand",
        status: "published",
        availability: "in_stock",
        isProvisional: true,
        stockQuantity: 2,
      },
    );
    createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 2 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111107",
    });
    expect(() =>
      createOrder({
        channel: "whatsapp_assisted",
        items: [{ productId: product.id, quantity: 1 }],
        customerName: "Bea",
        customerPhone: "+250788123457",
        idempotencyKey: "11111111-1111-4111-8111-111111111108",
      }),
    ).toThrow(/stock/i);
  });

  it("decrements on confirm and restores on cancel", async () => {
    const { adminGetProduct, adminUpsertProduct } =
      await import("@/lib/admin/store");
    const { cancelOrder, createOrder, transitionFulfilment } =
      await import("./store");
    const product = adminUpsertProduct(
      {
        sub: "test",
        email: "owner@example.com",
        role: "owner",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      {
        slug: `confirm-stock-${Date.now()}`,
        name: "Confirm Stock",
        description: "Confirm/cancel stock",
        priceAmount: 4000,
        brandSlug: "test-brand",
        brandName: "Test Brand",
        status: "published",
        availability: "in_stock",
        isProvisional: true,
        stockQuantity: 5,
      },
    );
    const order = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 2 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111201",
    });
    transitionFulfilment(order.id, "confirmed", "Paid offline", "staff@x.com");
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(3);
    expect(order.stockCommitted).toBe(true);
    cancelOrder(order.id, "Customer cancelled");
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(5);
    expect(order.stockCommitted).toBe(false);
  });

  it("prevents oversell when parallel confirms race after stock shrinks", async () => {
    const { adminGetProduct, adminUpsertProduct } =
      await import("@/lib/admin/store");
    const { commitOrderStock, createOrder } = await import("./store");
    const product = adminUpsertProduct(
      {
        sub: "test",
        email: "owner@example.com",
        role: "owner",
        exp: Math.floor(Date.now() / 1000) + 3600,
      },
      {
        slug: `race-stock-${Date.now()}`,
        name: "Race Stock",
        description: "Concurrent confirm",
        priceAmount: 4000,
        brandSlug: "test-brand",
        brandName: "Test Brand",
        status: "published",
        availability: "in_stock",
        isProvisional: true,
        stockQuantity: 2,
      },
    );
    const first = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111202",
    });
    const second = createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Bea",
      customerPhone: "+250788123457",
      idempotencyKey: "11111111-1111-4111-8111-111111111203",
    });

    // Simulate an external shrink between reserve and confirm.
    const live = adminGetProduct(product.id)!;
    live.stockQuantity = 1;

    commitOrderStock(first.id);
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(0);
    expect(() => commitOrderStock(second.id)).toThrow(/stock/i);
  });

  it("applies webhooks idempotently and never downgrades paid", async () => {
    const { createOrder, applyPaymentStatusFromWebhook } =
      await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    vi.stubEnv("ONLINE_PAYMENT_ENABLED", "true");
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    const order = createOrder({
      channel: "online_payment",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111106",
    });
    const first = applyPaymentStatusFromWebhook(order.id, "paid", "evt_a");
    expect(first.order.paymentStatus).toBe("paid");
    expect(first.duplicate).toBe(false);
    const dup = applyPaymentStatusFromWebhook(order.id, "paid", "evt_a");
    expect(dup.duplicate).toBe(true);
    applyPaymentStatusFromWebhook(order.id, "pending", "evt_late");
    expect(order.paymentStatus).toBe("paid");
  });
});
