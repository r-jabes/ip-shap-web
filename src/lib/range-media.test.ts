import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  fromPriceForCategory,
  getHomeCollections,
  homePageImageSources,
  HOME_MARQUEE_RANGES,
  RANGE_MEDIA,
} from "@/lib/range-media";

describe("range media", () => {
  it("assigns a distinct photograph to every range slot", () => {
    const srcs = Object.values(RANGE_MEDIA).map((m) => m.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it("lists six unique home-page image sources", () => {
    const srcs = homePageImageSources();
    expect(srcs).toHaveLength(6);
    expect(new Set(srcs).size).toBe(6);
  });

  it("builds three collection tiles with from-prices", () => {
    const tiles = getHomeCollections();
    expect(tiles.map((t) => t.slug)).toEqual(["wine", "sparkling", "vodka"]);
    for (const tile of tiles) {
      expect(tile.fromPrice?.amount).toBeGreaterThan(0);
      expect(homePageImageSources()).toContain(tile.image.src);
    }
  });

  it("returns the lowest gin price", () => {
    expect(fromPriceForCategory("gin")?.amount).toBe(60000);
  });

  it("keeps marquee labels in sync with the shop ranges", () => {
    expect([...HOME_MARQUEE_RANGES]).toEqual([
      "Whisky",
      "Wine",
      "Sparkling",
      "Vodka",
      "Gin",
    ]);
  });
});

describe("home page photo allocation", () => {
  const homeDir = join(process.cwd(), "src/components/home");
  const pageFile = join(process.cwd(), "src/app/(storefront)/page.tsx");

  function walk(dir: string): string[] {
    return readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) return walk(full);
      return /\.tsx?$/.test(name) ? [full] : [];
    });
  }

  it("renders each allocated product photo at most once across home sources", () => {
    const files = [...walk(homeDir), pageFile];
    const productSrc = /\/products\/[a-z0-9.-]+\.(?:jpe?g|png|webp|avif)/gi;
    const seen = new Map<string, string>();
    const dupes: string[] = [];

    for (const file of files) {
      const text = readFileSync(file, "utf8");
      // Ignore comments.
      const code = text
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/(^|[^:])\/\/.*$/gm, "$1");
      for (const match of code.matchAll(productSrc)) {
        const src = match[0];
        const prev = seen.get(src);
        if (prev && prev !== file) {
          dupes.push(`${src} in ${prev} and ${file}`);
        } else if (prev === file) {
          dupes.push(`${src} repeated in ${file}`);
        } else {
          seen.set(src, file);
        }
      }
    }

    // Home components should only reference RANGE_MEDIA keys, not raw paths —
    // so the scan should find zero literal /products/ strings (allocation lives
    // in lib/range-media). If a literal sneaks in, it must still be unique.
    expect(dupes).toEqual([]);
    for (const src of homePageImageSources()) {
      // Each allocated path may appear as a string literal at most once in home UI.
      // Prefer importing RANGE_MEDIA (zero literals); both are valid.
      void src;
    }
  });
});
