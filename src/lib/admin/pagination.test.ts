import { describe, expect, it } from "vitest";
import {
  buildAdminPageHref,
  paginateItems,
  parseAdminPage,
} from "./pagination";

describe("parseAdminPage", () => {
  it("defaults and clamps invalid values", () => {
    expect(parseAdminPage(undefined)).toBe(1);
    expect(parseAdminPage("0")).toBe(1);
    expect(parseAdminPage("-2")).toBe(1);
    expect(parseAdminPage("3")).toBe(3);
  });
});

describe("paginateItems", () => {
  it("slices and reports ranges", () => {
    const items = Array.from({ length: 45 }, (_, i) => i + 1);
    const page1 = paginateItems(items, 1, 20);
    expect(page1.items).toHaveLength(20);
    expect(page1.from).toBe(1);
    expect(page1.to).toBe(20);
    expect(page1.totalPages).toBe(3);

    const page3 = paginateItems(items, 3, 20);
    expect(page3.items).toEqual([41, 42, 43, 44, 45]);
    expect(page3.from).toBe(41);
    expect(page3.to).toBe(45);
  });

  it("clamps page past the end", () => {
    const result = paginateItems([1, 2], 9, 20);
    expect(result.page).toBe(1);
    expect(result.items).toEqual([1, 2]);
  });
});

describe("buildAdminPageHref", () => {
  it("preserves filters and omits page 1", () => {
    expect(buildAdminPageHref("/admin/products", { q: "wine" }, 1)).toBe(
      "/admin/products?q=wine",
    );
    expect(buildAdminPageHref("/admin/products", { q: "wine", page: "2" }, 3)).toBe(
      "/admin/products?q=wine&page=3",
    );
  });
});
