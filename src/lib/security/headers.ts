/**
 * Baseline security headers for Next.js `headers()` config.
 * CSP is intentionally strict for scripts/styles with Next.js exceptions.
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
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    // Next.js requires inline scripts/styles in App Router; tighten when nonce support is wired.
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self'",
  ];
  if (options.isProduction) {
    cspParts.push("upgrade-insecure-requests");
  }

  return [
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
  ];
}
