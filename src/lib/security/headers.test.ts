import { describe, expect, it } from "vitest";
import { securityHeaders } from "./headers";

describe("securityHeaders", () => {
  it("emits CSP with Turnstile, Supabase, and Sentry hosts", () => {
    const headers = securityHeaders();
    const csp = headers.find((h) => h.key === "Content-Security-Policy")?.value;
    expect(csp).toContain("challenges.cloudflare.com");
    expect(csp).toContain("*.supabase.co");
    expect(csp).toContain("*.ingest.sentry.io");
    expect(csp).toContain("frame-ancestors 'none'");
  });

  it("adds HSTS only in production", () => {
    const prod = securityHeaders({ isProduction: true });
    const dev = securityHeaders({ isProduction: false });
    expect(prod.some((h) => h.key === "Strict-Transport-Security")).toBe(true);
    expect(dev.some((h) => h.key === "Strict-Transport-Security")).toBe(false);
  });
});
