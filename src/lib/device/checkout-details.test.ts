import { describe, expect, it } from "vitest";
import {
  EMPTY_CHECKOUT_DETAILS,
  parseCheckoutDetails,
  serializeCheckoutDetails,
} from "./checkout-details";

describe("remembered checkout details", () => {
  it("round-trips trimmed details", () => {
    const raw = serializeCheckoutDetails({
      ...EMPTY_CHECKOUT_DETAILS,
      customerName: "  Aline Uwase ",
      customerPhone: "0788123456",
      deliveryDistrict: "Gasabo",
    });
    expect(parseCheckoutDetails(raw)).toMatchObject({
      customerName: "Aline Uwase",
      customerPhone: "0788123456",
      deliveryDistrict: "Gasabo",
    });
  });

  it("returns null when nothing useful is stored", () => {
    expect(parseCheckoutDetails(null)).toBeNull();
    expect(parseCheckoutDetails("nope")).toBeNull();
    expect(parseCheckoutDetails("[]")).toBeNull();
    expect(parseCheckoutDetails(serializeCheckoutDetails(EMPTY_CHECKOUT_DETAILS))).toBeNull();
  });

  it("ignores unknown keys and caps lengths", () => {
    const parsed = parseCheckoutDetails(
      JSON.stringify({ customerName: "x".repeat(500), isAdmin: true }),
    );
    expect(parsed?.customerName).toHaveLength(200);
    expect(parsed).not.toHaveProperty("isAdmin");
  });
});
