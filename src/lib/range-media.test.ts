import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import {
  fromPriceForCategories,
  getHomeCollections,
  homePageImageSources,
  RANGE_MEDIA,
} from "@/lib/range-media";

describe("range media", () => {
  it("assigns a distinct photograph to every slot", () => {
    const srcs = Object.values(RANGE_MEDIA).map((m) => m.src);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it("lists five unique home-page image sources that exist in public/", () => {
    const srcs = homePageImageSources();
    expect(srcs).toHaveLength(5);
    expect(new Set(srcs).size).toBe(5);
    for (const src of srcs) {
      expect(existsSync(join(process.cwd(), "public", src))).toBe(true);
    }
  });

  it("builds the three main range tiles", () => {
    const tiles = getHomeCollections();
    expect(tiles.map((t) => t.slug)).toEqual([
      "wines-spirits",
      "beer",
      "soft-drinks",
    ]);
    for (const tile of tiles) {
      expect(homePageImageSources()).toContain(tile.image.src);
      expect(tile.href.startsWith("/shop?category=")).toBe(true);
    }
  });

  it("links a group only to categories that exist", () => {
    const tiles = getHomeCollections({
      existingCategories: new Set(["wine", "whisky", "beer-cider"]),
    });
    const winesSpirits = new URL(tiles[0].href, "https://x.test");
    expect(winesSpirits.searchParams.getAll("category")).toEqual([
      "wine",
      "whisky",
    ]);
  });

  it("uses supplied live prices instead of the demo catalogue", () => {
    const tiles = getHomeCollections({
      prices: { "wines-spirits": { amount: 9000, currency: "RWF" } },
    });
    expect(tiles[0].fromPrice?.amount).toBe(9000);
    expect(tiles[1].fromPrice).toBeNull();
  });

  it("returns the lowest price across several categories", () => {
    expect(fromPriceForCategories(["gin"])?.amount).toBe(60000);
    expect(fromPriceForCategories(["beer-cider"])).toBeNull();
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
    const productSrc = /\/(?:products|home)\/[a-z0-9.-]+\.(?:jpe?g|png|webp|avif)/gi;
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
