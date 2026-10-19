import { describe, expect, it } from "vitest";
import { getHomeFeaturedSlides } from "@/lib/home-featured";
import { RANGE_MEDIA } from "@/lib/range-media";

describe("home featured slides", () => {
  const slides = getHomeFeaturedSlides();

  it("returns several slides, each with a link and a photo", () => {
    expect(slides.length).toBeGreaterThanOrEqual(3);
    const known = Object.values(RANGE_MEDIA).map((m) => m.src);
    for (const slide of slides) {
      expect(slide.title.length).toBeGreaterThan(0);
      expect(slide.href.startsWith("/")).toBe(true);
      expect(slide.secondaryHref.startsWith("/")).toBe(true);
      expect(known).toContain(slide.image.src);
    }
  });

  it("uses unique slide ids and never repeats a photo back to back", () => {
    expect(new Set(slides.map((s) => s.id)).size).toBe(slides.length);
    slides.forEach((slide, i) => {
      const next = slides[(i + 1) % slides.length]!;
      expect(next.image.src).not.toBe(slide.image.src);
    });
  });
});
