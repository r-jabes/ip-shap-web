import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEMO_PRODUCTS } from "@/fixtures/demo/catalogue";

const day = 24 * 60 * 60 * 1000;

describe("releaseExpiredHolds", () => {
  beforeEach(async () => {
    vi.resetModules();
    vi.unstubAllEnvs();
    globalThis.__ipShapOrderStore = undefined;
    globalThis.__ipShapAdminStore = undefined;
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "test");
    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
  });

  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  async function placeOrder(key: string) {
    const { createOrder } = await import("./store");
    const product = DEMO_PRODUCTS[0]!;
    return createOrder({
      channel: "whatsapp_assisted",
      items: [{ productId: product.id, quantity: 1 }],
      customerName: "Ada",
      customerPhone: "+250788123456",
      idempotencyKey: key,
    });
  }

  it("leaves a fresh order alone", async () => {
    const order = await placeOrder("22222222-2222-4222-8222-222222222201");
    const { releaseExpiredHolds } = await import("./holds");

    const result = await releaseExpiredHolds(
      new Date(Date.now() + 2 * day),
    );
    expect(result).toEqual({ released: 0, failed: 0 });
    expect(order.fulfilmentStatus).toBe("awaiting_confirmation");
  });

  it("cancels an unconfirmed order after three days and puts its stock back", async () => {
    const { getProductById } = await import("@/lib/catalogue");
    const product = DEMO_PRODUCTS[0]!;
    const before = getProductById(product.id)?.stockQuantity;
    const order = await placeOrder("22222222-2222-4222-8222-222222222202");
    const { releaseExpiredHolds, HOLD_EXPIRED_REASON } = await import(
      "./holds"
    );

    const result = await releaseExpiredHolds(new Date(Date.now() + 4 * day));
    expect(result).toEqual({ released: 1, failed: 0 });

    const { getOrderById } = await import("./store");
    const after = getOrderById(order.id)!;
    expect(after.fulfilmentStatus).toBe("cancelled");
    expect(after.statusHistory.at(-1)?.reason).toBe(HOLD_EXPIRED_REASON);
    expect(getProductById(product.id)?.stockQuantity).toBe(before);
  });

  it("never touches an order the team has confirmed", async () => {
    const order = await placeOrder("22222222-2222-4222-8222-222222222203");
    const { transitionFulfilment, getOrderById } = await import("./store");
    transitionFulfilment(order.id, "confirmed", "ok", "test");
    const { releaseExpiredHolds } = await import("./holds");

    const result = await releaseExpiredHolds(new Date(Date.now() + 10 * day));
    expect(result.released).toBe(0);
    expect(getOrderById(order.id)!.fulfilmentStatus).toBe("confirmed");
  });
});
