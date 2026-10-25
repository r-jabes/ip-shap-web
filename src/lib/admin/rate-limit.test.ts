import { beforeEach, describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimitForTests } from "./rate-limit";

describe("consumeRateLimit (legacy import path)", () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it("allows up to the limit then blocks", async () => {
    expect((await consumeRateLimit("k", 2, 60_000)).ok).toBe(true);
    expect((await consumeRateLimit("k", 2, 60_000)).ok).toBe(true);
    const blocked = await consumeRateLimit("k", 2, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
