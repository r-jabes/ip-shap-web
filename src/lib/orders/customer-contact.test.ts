import { describe, expect, it } from "vitest";
import {
  customerTelHref,
  customerWhatsAppHref,
  orderUpdateMessage,
} from "./customer-contact";

describe("customer contact links", () => {
  it("builds wa.me to the customer phone", () => {
    expect(customerWhatsAppHref("+250788123456", "Hi")).toBe(
      "https://wa.me/250788123456?text=Hi",
    );
  });

  it("adds the Rwanda country code to local numbers", () => {
    expect(customerWhatsAppHref("0788 123 456")).toBe(
      "https://wa.me/250788123456",
    );
  });

  it("words an order update using the first name", () => {
    expect(
      orderUpdateMessage({
        customerName: "Aline Uwase",
        reference: "IPS-ABC",
        statusLabel: "Out for delivery",
      }),
    ).toBe(
      "Hello Aline, this is IP SHAP about your order IPS-ABC. Status: Out for delivery.",
    );
  });

  it("builds tel: links", () => {
    expect(customerTelHref("+250 788 123 456")).toBe("tel:+250788123456");
  });

  it("returns null for unusable numbers", () => {
    expect(customerWhatsAppHref("123")).toBeNull();
    expect(customerTelHref("")).toBeNull();
  });
});
