import { describe, expect, it } from "vitest";
import { customerTelHref, customerWhatsAppHref } from "./customer-contact";

describe("customer contact links", () => {
  it("builds wa.me to the customer phone", () => {
    expect(customerWhatsAppHref("+250788123456", "Hi")).toBe(
      "https://wa.me/250788123456?text=Hi",
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
