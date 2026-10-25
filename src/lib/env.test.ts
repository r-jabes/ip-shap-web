import { afterEach, describe, expect, it, vi } from "vitest";

describe("getPublicEnv", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("defaults demo mode to true", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", undefined);
    const { getPublicEnv } = await import("./env");
    expect(getPublicEnv().NEXT_PUBLIC_DEMO_MODE).toBe(true);
  });

  it("parses demo mode false", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
    const { getPublicEnv } = await import("./env");
    expect(getPublicEnv().NEXT_PUBLIC_DEMO_MODE).toBe(false);
  });
});

describe("isDemoMode", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("never enables fixtures in production builds", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    vi.stubEnv("NODE_ENV", "production");
    const { isDemoMode, resetEnvCacheForTests } = await import("./env");
    resetEnvCacheForTests();
    expect(isDemoMode()).toBe(false);
  });
});
