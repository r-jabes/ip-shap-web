import { beforeEach, describe, expect, it } from "vitest";
import {
  createMemoryPushSubscriptionStore,
  isPersistableAdminUserId,
  setPushSubscriptionStoreForTests,
} from "@/lib/notifications/push/subscriptions";

const adminA = "11111111-1111-4111-8111-111111111111";
const adminB = "22222222-2222-4222-8222-222222222222";

const keys = {
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTsHaBg".padEnd(87, "A"),
  auth: "tBHItJI5svbpez7KI4CCXg",
};

describe("isPersistableAdminUserId", () => {
  it("accepts Auth UUIDs and rejects bootstrap ids", () => {
    expect(isPersistableAdminUserId(adminA)).toBe(true);
    expect(isPersistableAdminUserId("bootstrap:ops")).toBe(false);
    expect(isPersistableAdminUserId("not-a-uuid")).toBe(false);
  });
});

describe("memory push subscription store", () => {
  let store: ReturnType<typeof createMemoryPushSubscriptionStore>;

  beforeEach(() => {
    store = createMemoryPushSubscriptionStore();
    setPushSubscriptionStoreForTests(store);
  });

  it("upserts by endpoint idempotently and reassigns owner", async () => {
    const endpoint = "https://fcm.googleapis.com/fcm/send/device-1";
    const first = await store.upsert({
      adminUserId: adminA,
      endpoint,
      ...keys,
    });
    const second = await store.upsert({
      adminUserId: adminB,
      endpoint,
      ...keys,
      userAgent: "test",
    });

    expect(second.id).toBe(first.id);
    expect(second.adminUserId).toBe(adminB);
    expect(store.rows).toHaveLength(1);
    expect(second.disabledAt).toBeNull();
  });

  it("disables only for the owning admin", async () => {
    const endpoint = "https://fcm.googleapis.com/fcm/send/device-2";
    await store.upsert({ adminUserId: adminA, endpoint, ...keys });

    expect(await store.disableForAdmin(adminB, endpoint)).toBe(false);
    expect(await store.disableForAdmin(adminA, endpoint)).toBe(true);
    expect(await store.listActiveByAdmin(adminA)).toHaveLength(0);
    expect(await store.listAllActive()).toHaveLength(0);
  });

  it("hard-deletes by endpoint for 410 cleanup", async () => {
    const endpoint = "https://updates.push.services.mozilla.com/wpush/v2/x";
    await store.upsert({ adminUserId: adminA, endpoint, ...keys });
    expect(await store.deleteByEndpoint(endpoint)).toBe(true);
    expect(await store.deleteByEndpoint(endpoint)).toBe(false);
    expect(store.rows).toHaveLength(0);
  });

  it("purges soft-disabled rows older than the cutoff", async () => {
    const endpoint = "https://fcm.googleapis.com/fcm/send/old";
    await store.upsert({ adminUserId: adminA, endpoint, ...keys });
    await store.disableForAdmin(adminA, endpoint, new Date("2026-01-01T00:00:00Z"));
    expect(await store.purgeDisabled(new Date("2026-02-01T00:00:00Z"))).toBe(1);
    expect(store.rows).toHaveLength(0);
  });
});
