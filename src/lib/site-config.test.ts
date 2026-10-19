import { describe, expect, it } from "vitest";
import {
  chatHref,
  formatPhoneDisplay,
  mapsLink,
  readSiteConfig,
  whatsappLink,
} from "./site-config";

describe("site config", () => {
  it("exposes no contact fields when nothing is configured", () => {
    const config = readSiteConfig({});
    expect(config.whatsappDigits).toBeNull();
    expect(config.email).toBeNull();
    expect(whatsappLink("hi", config)).toBeNull();
    expect(chatHref("hi", config)).toBe("/contact");
  });

  it("normalises a valid WhatsApp number and builds a wa.me link", () => {
    const config = readSiteConfig({
      NEXT_PUBLIC_WHATSAPP_E164: "+250 788 123 456",
    });
    expect(config.whatsappDigits).toBe("250788123456");
    expect(whatsappLink("Hello there", config)).toBe(
      "https://wa.me/250788123456?text=Hello%20there",
    );
    expect(chatHref(undefined, config)).toBe("https://wa.me/250788123456");
  });

  it("rejects malformed numbers instead of rendering them", () => {
    const config = readSiteConfig({
      NEXT_PUBLIC_WHATSAPP_E164: "not a number",
    });
    expect(config.whatsappDigits).toBeNull();
  });

  it("formats display phone numbers", () => {
    expect(formatPhoneDisplay("250788123456")).toBe("+250 788 123 456");
  });

  it("builds a Maps link only when an address is set", () => {
    expect(mapsLink(readSiteConfig({}))).toBeNull();
    const config = readSiteConfig({
      NEXT_PUBLIC_ADDRESS: "Kigali, Rwanda",
    });
    expect(mapsLink(config)).toContain(encodeURIComponent("Kigali, Rwanda"));
  });
});
