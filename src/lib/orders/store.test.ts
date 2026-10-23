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

  it("records manual payment with an amount; reference and note are optional", async () => {
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
      markManualPayment(order.id, { amount: 0, actorLabel: "staff@example.com" }),
    ).toThrow(/amount/i);
    const discounted = order.total.amount - 1000;
    const paid = markManualPayment(order.id, {
      amount: discounted,
      actorLabel: "staff@example.com",
    });
    expect(paid.paymentStatus).toBe("paid");
    expect(paid.amountPaid?.amount).toBe(discounted);
    expect(paid.statusHistory.at(-1)?.reason).toMatch(
      /Payment of .* recorded · staff@example\.com$/,
    );
    expect(() =>
      markManualPayment(order.id, {
        amount: order.total.amount,
        reference: "MOMO-100",
        note: "again",
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

  it("decrements on place and restores on cancel; confirm does not touch stock", async () => {
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
        slug: `place-stock-${Date.now()}`,
        name: "Place Stock",
        description: "Place/cancel stock",
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
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(3);
    expect(order.stockCommitted).toBe(true);
    expect(order.stockReserved).toBe(true);
    transitionFulfilment(order.id, "confirmed", "Paid offline", "staff@x.com");
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(3);
    cancelOrder(order.id, "Customer cancelled");
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(5);
    expect(order.stockCommitted).toBe(false);
  });

  it("prevents oversell when a second place-order would exceed on-hand", async () => {
    const { adminGetProduct, adminUpsertProduct } =
      await import("@/lib/admin/store");
    const { createOrder } = await import("./store");
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
        description: "Concurrent place",
        priceAmount: 4000,
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
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: "11111111-1111-4111-8111-111111111202",
    });
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(1);
    createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Bea",
      customerPhone: "+250788123457",
      idempotencyKey: "11111111-1111-4111-8111-111111111203",
    });
    expect(adminGetProduct(product.id)?.stockQuantity).toBe(0);
    expect(() =>
      createOrder({
        channel: "whatsapp_assisted",
        items: [{ productId: product.id, quantity: 1 }],
        customerName: "Cara",
        customerPhone: "+250788123458",
        idempotencyKey: "11111111-1111-4111-8111-111111111204",
      }),
    ).toThrow(/stock/i);
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
