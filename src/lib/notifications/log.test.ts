import { beforeEach, describe, expect, it } from "vitest";
import { notifyOrderEvent, resetNotificationIdempotencyForTests } from "./log";

describe("log notification adapter", () => {
  beforeEach(() => {
    resetNotificationIdempotencyForTests();
  });

  it("skips duplicate idempotency keys without failing", () => {
    const payload = {
      templateId: "payment_received" as const,
      orderReference: "IPS-TEST",
      idempotencyKey: "notif-dup-1",
    };
    expect(notifyOrderEvent(payload).skippedDuplicate).toBeUndefined();
    expect(notifyOrderEvent(payload).skippedDuplicate).toBe(true);
  });
});
