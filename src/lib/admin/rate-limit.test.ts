import { beforeEach, describe, expect, it } from "vitest";
import { consumeRateLimit, resetRateLimitForTests } from "./rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    resetRateLimitForTests();
  });

  it("allows up to the limit then blocks", () => {
    expect(consumeRateLimit("k", 2, 60_000).ok).toBe(true);
    expect(consumeRateLimit("k", 2, 60_000).ok).toBe(true);
    const blocked = consumeRateLimit("k", 2, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });
});
