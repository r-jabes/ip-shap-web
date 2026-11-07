import { beforeEach, describe, expect, it, vi } from "vitest";
import { moneyRwf } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders/store";
import {
  createMemoryPushSubscriptionStore,
  setPushSubscriptionStoreForTests,
} from "@/lib/notifications/push/subscriptions";
import { resetEnvCacheForTests } from "@/lib/env";

const sendNotification = vi.fn();
const setVapidDetails = vi.fn();

vi.mock("web-push", () => ({
  setVapidDetails: (...args: unknown[]) => setVapidDetails(...args),
  sendNotification: (...args: unknown[]) => sendNotification(...args),
}));

import {
  buildNewOrderPushPayload,
  sendWebPushToStaff,
} from "@/lib/notifications/push/send";

const order = {
  id: "ord-1",
  reference: "IPS-TEST123",
  total: moneyRwf(15000),
} as StoredOrder;

const keys = {
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTsHaBg".padEnd(87, "A"),
  auth: "tBHItJI5svbpez7KI4CCXg",
};

describe("buildNewOrderPushPayload", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.the-ipshap.com");
    resetEnvCacheForTests();
  });

  it("keeps title/body compact and deep-links to the admin order", () => {
    const payload = buildNewOrderPushPayload(order);
    expect(payload.title).toBe("New order");
    expect(payload.body).toContain("IPS-TEST123");
    expect(payload.url).toBe(
      "https://www.the-ipshap.com/admin/orders/ord-1",
    );
    expect(JSON.stringify(payload).length).toBeLessThan(500);
  });
});

describe("sendWebPushToStaff", () => {
  let store: ReturnType<typeof createMemoryPushSubscriptionStore>;

  beforeEach(() => {
    store = createMemoryPushSubscriptionStore();
    setPushSubscriptionStoreForTests(store);
    sendNotification.mockReset();
    setVapidDetails.mockReset();
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "https://www.the-ipshap.com");
    vi.stubEnv("NEXT_PUBLIC_VAPID_PUBLIC_KEY", "BPublicKeyForTestsAAAAAAAAAA");
    vi.stubEnv("VAPID_PRIVATE_KEY", "PrivateKeyForTestsAAAAAAAAAAAA");
    vi.stubEnv("VAPID_SUBJECT", "mailto:hello@the-ipshap.com");
    resetEnvCacheForTests();
  });

  it("skips when there are no subscriptions", async () => {
    const result = await sendWebPushToStaff({
      title: "New order",
      body: "test",
      url: "/admin/orders",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.skipped).toBe("no_subscriptions");
    }
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("delivers to active devices and prunes 410 Gone endpoints", async () => {
    await store.upsert({
      adminUserId: "11111111-1111-4111-8111-111111111111",
      endpoint: "https://fcm.googleapis.com/fcm/send/alive",
      ...keys,
    });
    await store.upsert({
      adminUserId: "11111111-1111-4111-8111-111111111111",
      endpoint: "https://fcm.googleapis.com/fcm/send/dead",
      ...keys,
    });

    sendNotification.mockImplementation(async (subscription: { endpoint: string }) => {
      if (subscription.endpoint.includes("dead")) {
        const error = new Error("Gone") as Error & { statusCode: number };
        error.statusCode = 410;
        throw error;
      }
    });

    const result = await sendWebPushToStaff({
      title: "New order",
      body: "IPS-TEST123",
      url: "/admin/orders/ord-1",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.summary.delivered).toBe(1);
      expect(result.summary.removed).toBe(1);
    }
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]?.endpoint).toContain("alive");
  });
});
