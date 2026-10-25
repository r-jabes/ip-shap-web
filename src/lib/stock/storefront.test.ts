import { describe, expect, it } from "vitest";
import {
  describeStock,
  maxOrderableQuantity,
} from "@/lib/stock/storefront";

describe("maxOrderableQuantity", () => {
  it("is zero when out of stock", () => {
    expect(
      maxOrderableQuantity({ availability: "out_of_stock", stockQuantity: 4 }),
    ).toBe(0);
  });

  it("caps counted stock at the per-line limit", () => {
    expect(
      maxOrderableQuantity({ availability: "in_stock", stockQuantity: 19 }),
    ).toBe(19);
    expect(
      maxOrderableQuantity({ availability: "in_stock", stockQuantity: 500 }),
    ).toBe(99);
  });

  it("allows the line limit when quantity is not tracked", () => {
    expect(
      maxOrderableQuantity({ availability: "unknown", stockQuantity: null }),
    ).toBe(99);
  });
});

describe("describeStock", () => {
  it("labels out of stock explicitly", () => {
    expect(
      describeStock({ availability: "out_of_stock", stockQuantity: 0 }),
    ).toMatchObject({ tone: "out", label: "Out of stock", max: 0 });
  });

  it("warns when only a few are left", () => {
    expect(
      describeStock({ availability: "low_stock", stockQuantity: 3 }),
    ).toMatchObject({ tone: "low", label: "Only 3 left", max: 3 });
  });

  it("shows the available quantity otherwise", () => {
    expect(
      describeStock({ availability: "in_stock", stockQuantity: 19 }),
    ).toMatchObject({ tone: "in", label: "19 in stock", max: 19 });
  });

  it("stays quiet when nothing is known", () => {
    expect(
      describeStock({ availability: "unknown", stockQuantity: null }).label,
    ).toBe("");
  });
});
