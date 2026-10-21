/**
 * Baseline security headers for Next.js `headers()` config.
 * CSP allows Next.js inline hydration, Cloudflare Turnstile, Supabase, and Sentry
 * when those integrations are configured. Nonces (remove unsafe-inline/eval) remain
 * a tracked hardening step — see documentation/SECURITY.md waiver.
 */
export function securityHeaders(
  options: { isProduction?: boolean } = {},
): Array<{ key: string; value: string }> {
  const cspParts = [
    "default-src 'self'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "object-src 'none'",
    // Catalogue derivatives may be on Supabase storage; data/blob for local/optimistic UI.
    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self' data:",
    // Next.js App Router still needs inline scripts/styles; Turnstile loads from Cloudflare.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline'",
    "frame-src https://challenges.cloudflare.com",
    // API + realtime + ingest (regional Sentry hosts covered by wildcard).
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
    "worker-src 'self' blob:",
  ];
  if (options.isProduction) {
    cspParts.push("upgrade-insecure-requests");
  }

  const headers: Array<{ key: string; value: string }> = [
    { key: "Content-Security-Policy", value: cspParts.join("; ") },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=()",
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin",
    },
    {
      key: "Cross-Origin-Resource-Policy",
      value: "same-site",
    },
  ];

  if (options.isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
