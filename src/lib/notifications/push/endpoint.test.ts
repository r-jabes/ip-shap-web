import { describe, expect, it } from "vitest";
import { validatePushSubscriptionInput } from "@/lib/notifications/push/endpoint";

const validKeys = {
  // Lengths match browser base64url P-256 / auth secrets (approx).
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTsHaBg".padEnd(87, "A"),
  auth: "tBHItJI5svbpez7KI4CCXg",
};

describe("validatePushSubscriptionInput", () => {
  it("accepts a Chrome FCM endpoint", () => {
    const result = validatePushSubscriptionInput({
      endpoint: "https://fcm.googleapis.com/fcm/send/abc123",
      keys: validKeys,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.endpoint).toContain("fcm.googleapis.com");
    }
  });

  it("accepts Apple Push subdomain endpoints", () => {
    const result = validatePushSubscriptionInput({
      endpoint: "https://web.push.apple.com/QABCDEF",
      keys: validKeys,
    });
    expect(result.ok).toBe(true);
  });

  it("rejects non-HTTPS and unknown hosts (SSRF guard)", () => {
    expect(
      validatePushSubscriptionInput({
        endpoint: "http://fcm.googleapis.com/fcm/send/x",
        keys: validKeys,
      }).ok,
    ).toBe(false);

    expect(
      validatePushSubscriptionInput({
        endpoint: "https://evil.example/steal",
        keys: validKeys,
      }).ok,
    ).toBe(false);
  });

  it("rejects missing keys or wrong key lengths", () => {
    expect(
      validatePushSubscriptionInput({
        endpoint: "https://fcm.googleapis.com/fcm/send/x",
        keys: { p256dh: "short", auth: "nope" },
      }).ok,
    ).toBe(false);

    expect(
      validatePushSubscriptionInput({
        endpoint: "https://fcm.googleapis.com/fcm/send/x",
      }).ok,
    ).toBe(false);
  });
});
