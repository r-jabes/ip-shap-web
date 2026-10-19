import { afterEach, describe, expect, it, vi } from "vitest";
import { MOTION, prefersReducedMotion } from "./motion";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("motion tokens", () => {
  it("keeps named durations aligned with CSS intent", () => {
    expect(MOTION.fastMs).toBeLessThan(MOTION.uiMs);
    expect(MOTION.uiMs).toBeLessThan(MOTION.editorialMs);
    expect(MOTION.editorialMs).toBeLessThan(MOTION.heroMs);
  });

  it("reads prefers-reduced-motion when matchMedia exists", () => {
    vi.stubGlobal("matchMedia", (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    expect(prefersReducedMotion()).toBe(true);
  });
});
