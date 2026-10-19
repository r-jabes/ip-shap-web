import { describe, expect, it } from "vitest";
import { buildNavData, groupCategories } from "./navigation";

describe("navigation model", () => {
  it("groups categories and drops empty ones", () => {
    const groups = groupCategories(
      [
        { slug: "a", name: "A", group: "One", description: "" },
        { slug: "b", name: "B", group: "One", description: "" },
        { slug: "c", name: "C", group: "Two", description: "" },
      ],
      (slug) => (slug === "b" ? 0 : 2),
    );
    expect(groups).toEqual([
      {
        title: "One",
        categories: [{ slug: "a", name: "A", description: "", count: 2 }],
      },
      {
        title: "Two",
        categories: [{ slug: "c", name: "C", description: "", count: 2 }],
      },
    ]);
  });

  it("builds menu data from the demo catalogue", () => {
    const nav = buildNavData();
    expect(nav.totalProducts).toBeGreaterThan(0);
    expect(nav.groups.map((group) => group.title)).toEqual(["Spirits", "Wine"]);
    expect(nav.promo?.href).toMatch(/^\/product\//);
  });
});
