import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

/**
 * Single source for customer-facing business facts.
 *
 * Every contact field is `null` until the business confirms it, and the UI only renders fields
 * that exist. Nothing here is a placeholder value. Public (non-secret) values come from
 * `NEXT_PUBLIC_*` variables so they can be changed per environment without code edits.
 * See documentation/ENVIRONMENT.md.
 */

const E164 = /^\+?[0-9]{8,15}$/;

function cleanPhone(value: string | undefined): string | null {
  if (!value) return null;
  const compact = value.replace(/[\s()-]/g, "");
  return E164.test(compact) ? compact.replace(/^\+/, "") : null;
}

function cleanText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export type SiteConfig = {
  name: string;
  legalName: string;
  country: string;
  /** Digits only with country code (no "+"), e.g. "250788123456". */
  whatsappDigits: string | null;
  phoneDigits: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
};

export function readSiteConfig(
  env: Record<string, string | undefined> = {
    NEXT_PUBLIC_WHATSAPP_E164: process.env.NEXT_PUBLIC_WHATSAPP_E164,
    NEXT_PUBLIC_PHONE_E164: process.env.NEXT_PUBLIC_PHONE_E164,
    NEXT_PUBLIC_CONTACT_EMAIL: process.env.NEXT_PUBLIC_CONTACT_EMAIL,
    NEXT_PUBLIC_ADDRESS: process.env.NEXT_PUBLIC_ADDRESS,
    NEXT_PUBLIC_OPENING_HOURS: process.env.NEXT_PUBLIC_OPENING_HOURS,
  },
): SiteConfig {
  return {
    name: SHORT_BRAND,
    legalName: LEGAL_NAME,
    country: "Rwanda",
    whatsappDigits: cleanPhone(env.NEXT_PUBLIC_WHATSAPP_E164),
    phoneDigits: cleanPhone(env.NEXT_PUBLIC_PHONE_E164),
    email: cleanText(env.NEXT_PUBLIC_CONTACT_EMAIL),
    address: cleanText(env.NEXT_PUBLIC_ADDRESS),
    hours: cleanText(env.NEXT_PUBLIC_OPENING_HOURS),
  };
}

export const SITE = readSiteConfig();

/** Formats digits as "+250 788 123 456"-style display text (groups of 3 after the country code). */
export function formatPhoneDisplay(digits: string): string {
  const country = digits.slice(0, 3);
  const rest = digits.slice(3).replace(/(\d{3})(?=\d)/g, "$1 ");
  return `+${country} ${rest}`.trim();
}

/** wa.me deep link, or `null` when no WhatsApp number is configured. */
export function whatsappLink(
  message?: string,
  config: SiteConfig = SITE,
): string | null {
  if (!config.whatsappDigits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${config.whatsappDigits}${text}`;
}

/** Best "talk to us" destination: WhatsApp when configured, otherwise the contact page. */
export function chatHref(message?: string, config: SiteConfig = SITE): string {
  return whatsappLink(message, config) ?? "/contact";
}

/** Google Maps search for the published address, or null when unset. */
export function mapsLink(config: SiteConfig = SITE): string | null {
  if (!config.address) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.address)}`;
}
