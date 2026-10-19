import { afterEach, describe, expect, it, vi } from "vitest";

describe("listProducts", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("returns demo products when demo mode is enabled", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    expect(listProducts().length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    const wines = listProducts({ categorySlug: "wine" });
    expect(wines.every((product) => product.categorySlug === "wine")).toBe(
      true,
    );
  });

  it("sorts by price ascending", async () => {
    vi.stubEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
    const { listProducts } = await import("./catalogue");
    const sorted = listProducts({ sort: "price_asc" });
    const amounts = sorted.map((product) => product.price.amount);
    expect(amounts).toEqual([...amounts].sort((a, b) => a - b));
  });
});
