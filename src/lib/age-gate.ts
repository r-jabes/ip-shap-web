/**
 * Age gate helpers.
 *
 * The gate is decided in the browser, not on the server. Reading cookies or headers in the
 * storefront layout would make every page render per request and defeat CDN caching, so the
 * page is the same for everyone and a tiny inline script hides the gate for returning visitors
 * and search crawlers before the first paint.
 */

/** Readable by the page script (not HttpOnly) — it only records "was asked", nothing private. */
export const AGE_GATE_COOKIE = "ip_shap_age_v2";
export const AGE_GATE_MAX_AGE_SEC = 60 * 60 * 24 * 365; // 1 year
/** Attribute set on <html> when the gate should stay hidden. */
export const AGE_GATE_OK_ATTRIBUTE = "data-age-ok";

/** Well-known crawlers — must never be stopped by the age gate (SEO). */
const BOT_UA =
  /googlebot|bingbot|slurp|duckduckbot|baiduspider|yandex|facebookexternalhit|twitterbot|linkedinbot|applebot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|bytespider/i;

export function isCrawlerUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return BOT_UA.test(ua);
}

/**
 * Runs before the gate is painted. Marks <html> when the visitor already confirmed their age
 * or is a crawler; a stylesheet rule then hides the gate with no flash.
 */
export const AGE_GATE_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;if(/${BOT_UA.source}/i.test(navigator.userAgent||"")||document.cookie.indexOf("${AGE_GATE_COOKIE}=1")>-1){d.setAttribute("${AGE_GATE_OK_ATTRIBUTE}","1")}}catch(e){}})();`;

/** Browser-only: remember the answer and hide the gate straight away. */
export function confirmAgeInBrowser(): void {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AGE_GATE_COOKIE}=1; Path=/; Max-Age=${AGE_GATE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
  document.documentElement.setAttribute(AGE_GATE_OK_ATTRIBUTE, "1");
}
