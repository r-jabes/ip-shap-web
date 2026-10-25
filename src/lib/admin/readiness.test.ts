import { describe, expect, it } from "vitest";
import { publishIssues } from "@/lib/admin/readiness";
import { moneyRwf } from "@/lib/money";

const ready = {
  name: "Merlot",
  price: moneyRwf(12_000),
  images: [{}] as never[],
  categorySlug: "wine",
};

describe("publishIssues", () => {
  it("is empty when a product has everything it needs", () => {
    expect(publishIssues(ready)).toEqual([]);
  });

  it("lists everything that is missing in plain English", () => {
    expect(
      publishIssues({
        ...ready,
        price: moneyRwf(0),
        images: [],
        categorySlug: "uncategorised",
      }),
    ).toEqual(["Add a price", "Add a photo", "Choose a category"]);
  });
});
