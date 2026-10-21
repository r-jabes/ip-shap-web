import { cookies } from "next/headers";

export const AGE_GATE_COOKIE = "ip_shap_age_ok";
export const AGE_GATE_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year

/** Well-known crawlers — must never see the age gate (SEO). */
const BOT_UA =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider/i;

export function isCrawlerUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

export async function hasAgeVerifiedCookie(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(AGE_GATE_COOKIE)?.value === "1";
}

/**
 * Whether to show the age gate for this request.
 * Crawlers always pass; humans need the cookie.
 */
export async function shouldShowAgeGate(
  userAgent: string | null | undefined,
): Promise<boolean> {
  if (isCrawlerUserAgent(userAgent)) return false;
  return !(await hasAgeVerifiedCookie());
}
