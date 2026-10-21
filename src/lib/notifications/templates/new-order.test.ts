import { describe, expect, it } from "vitest";
import { moneyRwf } from "@/lib/money";
import type { StoredOrder } from "@/lib/orders/store";
import {
  brandedFromAddress,
  buildNewOrderStaffEmail,
  EMAIL_BRAND,
} from "./new-order";

function sampleOrder(): StoredOrder {
  return {
    id: "ord-1",
    reference: "IPS-7K9M2X4QH3N6P8R0",
    lookupToken: "tok",
    channel: "whatsapp_assisted",
    fulfilmentStatus: "awaiting_confirmation",
    paymentStatus: "not_applicable",
    subtotal: moneyRwf(12000),
    deliveryFee: null,
    total: moneyRwf(12000),
    items: [
      {
        productId: "p1",
        productName: 'Test <Bottle> & Co',
        productSlug: "test-bottle",
        quantity: 2,
        unitPrice: moneyRwf(6000),
        lineTotal: moneyRwf(12000),
      },
    ],
    customerName: "Ada <O>",
    customerPhone: "+250788123456",
    idempotencyKey: "11111111-1111-4111-8111-111111111301",
    stockReserved: true,
    stockCommitted: true,
    reservationExpiresAt: null,
    statusHistory: [],
    createdAt: "2026-10-21T16:00:00.000Z",
    updatedAt: "2026-10-21T16:00:00.000Z",
  };
}

describe("buildNewOrderStaffEmail", () => {
  it("produces branded subject, html, and text", () => {
    const content = buildNewOrderStaffEmail({
      order: sampleOrder(),
      adminUrl: "https://shop.example/admin/orders/ord-1",
      logoUrl: "https://shop.example/branding/main-logo-reversed.png",
      appUrl: "https://shop.example",
    });

    expect(content.subject).toBe("IP SHAP · New order IPS-7K9M2X4QH3N6P8R0");
    expect(content.preheader).toContain("Ada");
    expect(content.html).toContain(EMAIL_BRAND.burntOrange);
    expect(content.html).toContain(EMAIL_BRAND.charcoal);
    expect(content.html).toContain("THE IP SHAP BUSINESS LTD");
    expect(content.html).toContain("main-logo-reversed.png");
    expect(content.html).toContain("Open order in admin");
    expect(content.html).toContain("Test &lt;Bottle&gt; &amp; Co");
    expect(content.html).not.toContain("Test <Bottle>");
    expect(content.text).toContain("IP SHAP — new order");
    expect(content.text).toContain("Africa/Kigali");
    expect(content.text).toContain("THE IP SHAP BUSINESS LTD");
  });

  it("prefixes bare From addresses with the brand display name", () => {
    expect(brandedFromAddress("orders@example.com")).toBe(
      "IP SHAP Orders <orders@example.com>",
    );
    expect(brandedFromAddress("IP SHAP <orders@example.com>")).toBe(
      "IP SHAP <orders@example.com>",
    );
  });
});
