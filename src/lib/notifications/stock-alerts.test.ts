import { describe, expect, it } from "vitest";
import type { DemoProduct } from "@/domain/catalogue";
import { findStockAlerts, stockAlertKey } from "@/lib/notifications/stock-alerts";
import { buildLowStockEmail } from "@/lib/notifications/templates/low-stock";

function product(overrides: Partial<DemoProduct>): DemoProduct {
  return {
    id: "p",
    name: "Item",
    status: "published",
    availability: "in_stock",
    stockQuantity: 20,
    ...overrides,
  } as DemoProduct;
}

describe("stock alerts", () => {
  const products = [
    product({ name: "Fine" }),
    product({ name: "Gone", availability: "out_of_stock", stockQuantity: 0 }),
    product({ name: "Nearly", availability: "low_stock", stockQuantity: 2 }),
    product({ name: "Hidden draft", status: "draft", availability: "out_of_stock" }),
  ];

  it("lists only published products that are sold out or low", () => {
    const alerts = findStockAlerts(products);
    expect(alerts.soldOut.map((line) => line.name)).toEqual(["Gone"]);
    expect(alerts.low).toEqual([{ name: "Nearly", quantity: 2 }]);
  });

  it("uses the same key for the same problems, in any order, and a new key when they change", () => {
    const a = findStockAlerts(products);
    const b = findStockAlerts([...products].reverse());
    expect(stockAlertKey(a)).toBe(stockAlertKey(b));
    const changed = findStockAlerts([
      ...products,
      product({ name: "New problem", availability: "out_of_stock" }),
    ]);
    expect(stockAlertKey(changed)).not.toBe(stockAlertKey(a));
  });

  it("writes a plain-English email that escapes product names", () => {
    const email = buildLowStockEmail({
      soldOut: [{ name: "<b>Gone</b>", quantity: 0 }],
      low: [{ name: "Nearly", quantity: 2 }],
      adminUrl: "https://example.com/admin/products?status=low",
      logoUrl: "cid:logo",
      appUrl: "https://example.com",
    });
    expect(email.subject).toBe("Stock alert: 1 sold out, 1 running low");
    expect(email.html).toContain("&lt;b&gt;Gone&lt;/b&gt;");
    expect(email.html).not.toContain("<b>Gone</b>");
    expect(email.text).toContain("Nearly (2 left)");
  });
});
