import { beforeEach, describe, expect, it, vi } from "vitest";

const rpc = vi.fn();
let client: { rpc: typeof rpc } | null = null;

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServiceClient: () => client,
}));

import { consumeRateLimit, resetRateLimitForTests } from "./rate-limit";

describe("consumeRateLimit", () => {
  beforeEach(() => {
    resetRateLimitForTests();
    rpc.mockReset();
    client = null;
  });

  it("allows up to the limit then blocks (per-instance fallback)", async () => {
    expect((await consumeRateLimit("k", 2, 60_000)).ok).toBe(true);
    expect((await consumeRateLimit("k", 2, 60_000)).ok).toBe(true);
    const blocked = await consumeRateLimit("k", 2, 60_000);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("uses the shared database counter when Supabase is configured", async () => {
    client = { rpc };
    rpc.mockResolvedValueOnce({
      data: [{ allowed: true, retry_after: 0 }],
      error: null,
    });
    rpc.mockResolvedValueOnce({
      data: [{ allowed: false, retry_after: 42 }],
      error: null,
    });

    expect(await consumeRateLimit("checkout:1.2.3.4", 5, 15 * 60_000)).toEqual({
      ok: true,
    });
    expect(rpc).toHaveBeenCalledWith("consume_rate_limit", {
      p_key: "checkout:1.2.3.4",
      p_limit: 5,
      p_window_seconds: 900,
    });
    expect(await consumeRateLimit("checkout:1.2.3.4", 5, 15 * 60_000)).toEqual({
      ok: false,
      retryAfterSec: 42,
    });
  });

  it("falls back to the per-instance counter instead of failing when the database errors", async () => {
    client = { rpc };
    rpc.mockResolvedValue({ data: null, error: new Error("db down") });

    expect((await consumeRateLimit("k", 1, 60_000)).ok).toBe(true);
    expect((await consumeRateLimit("k", 1, 60_000)).ok).toBe(false);
  });
});
