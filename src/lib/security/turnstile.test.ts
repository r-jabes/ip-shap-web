import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetEnvCacheForTests } from "@/lib/env";
import { verifyTurnstileToken } from "./turnstile";

describe("verifyTurnstileToken", () => {
  beforeEach(() => {
    resetEnvCacheForTests();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TURNSTILE_SECRET_KEY;
    resetEnvCacheForTests();
  });

  it("skips when secret is unset", async () => {
    const result = await verifyTurnstileToken("");
    expect(result).toEqual({ ok: true });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("rejects missing token when secret is set", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret-key-value";
    resetEnvCacheForTests();
    const result = await verifyTurnstileToken("");
    expect(result).toEqual({ ok: false, reason: "missing_token" });
  });

  it("accepts Cloudflare success", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret-key-value";
    resetEnvCacheForTests();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const result = await verifyTurnstileToken("token-abc", "1.2.3.4");
    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledOnce();
  });

  it("rejects Cloudflare failure", async () => {
    process.env.TURNSTILE_SECRET_KEY = "test-secret-key-value";
    resetEnvCacheForTests();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ success: false }),
    } as Response);

    const result = await verifyTurnstileToken("bad");
    expect(result).toEqual({ ok: false, reason: "rejected" });
  });
});
