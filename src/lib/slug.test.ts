import { describe, expect, it } from "vitest";
import { isValidSlug, slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("makes URL-safe slugs", () => {
    expect(slugify("Johnnie Walker Black Label")).toBe(
      "johnnie-walker-black-label",
    );
    expect(slugify("  LIBOLL Rosé Extra Dry! ")).toBe("liboll-rose-extra-dry");
    expect(slugify("Brandy & Cognac")).toBe("brandy-and-cognac");
    expect(slugify("!!!")).toBe("");
  });

  it("always yields valid slugs when non-empty", () => {
    for (const name of ["Red wine", "ADEGAMÃE", "Pinta Negra 2024"]) {
      expect(isValidSlug(slugify(name))).toBe(true);
    }
  });
});

describe("uniqueSlug", () => {
  it("appends a counter when taken", () => {
    const taken = new Set(["house-red", "house-red-2"]);
    expect(uniqueSlug("House Red", taken)).toBe("house-red-3");
    expect(uniqueSlug("House White", taken)).toBe("house-white");
  });

  it("falls back for names without usable characters", () => {
    const slug = uniqueSlug("***", new Set(), "product");
    expect(slug.startsWith("product-")).toBe(true);
    expect(isValidSlug(slug)).toBe(true);
  });
});
