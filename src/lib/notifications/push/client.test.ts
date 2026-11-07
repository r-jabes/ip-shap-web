import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "@/lib/notifications/push/client";

describe("urlBase64ToUint8Array", () => {
  it("decodes URL-safe base64 without padding", () => {
    // "Hi" in base64url
    const bytes = urlBase64ToUint8Array("SGk");
    expect(Array.from(bytes)).toEqual([72, 105]);
  });
});
