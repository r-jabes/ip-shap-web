import { afterEach, describe, expect, it, vi } from "vitest";

describe("resolveAdminLogin bootstrap", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("accepts a valid break-glass token", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv(
      "ADMIN_SESSION_SECRET",
      "test-secret-at-least-32-characters-long!!",
    );
    vi.stubEnv("ADMIN_BOOTSTRAP_TOKEN", "bootstrap-token-16");
    vi.stubEnv("ADMIN_BOOTSTRAP_EMAIL", "owner@example.com");

    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    const { resolveAdminLogin } = await import("./auth-login");
    const result = await resolveAdminLogin({
      email: "owner@example.com",
      password: "",
      bootstrapToken: "bootstrap-token-16",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.role).toBe("owner");
      expect(result.session.email).toBe("owner@example.com");
    }
  });

  it("rejects wrong break-glass token with a generic error", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv(
      "ADMIN_SESSION_SECRET",
      "test-secret-at-least-32-characters-long!!",
    );
    vi.stubEnv("ADMIN_BOOTSTRAP_TOKEN", "bootstrap-token-16");

    const { resetEnvCacheForTests } = await import("@/lib/env");
    resetEnvCacheForTests();
    const { resolveAdminLogin, GENERIC_AUTH_ERROR } =
      await import("./auth-login");
    const result = await resolveAdminLogin({
      email: "owner@example.com",
      password: "",
      bootstrapToken: "wrong-token-xxxxx",
    });

    expect(result).toEqual({ ok: false, error: GENERIC_AUTH_ERROR });
  });
});
