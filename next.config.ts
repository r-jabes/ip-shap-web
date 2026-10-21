import path from "node:path";
import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import bundleAnalyzer from "@next/bundle-analyzer";
import { securityHeaders } from "./src/lib/security/headers";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Avoid picking up unrelated lockfiles higher in the user profile tree.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Prefer modern formats when the optimizer can produce them; JPEG/PNG remain fallbacks.
    formats: ["image/avif", "image/webp"],
    // SVG disabled at the optimizer boundary — catalogue uses raster derivatives.
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders({
          isProduction: process.env.NODE_ENV === "production",
        }),
      },
    ];
  },
};

/**
 * Sentry wrapper is always applied; source-map upload runs only when
 * SENTRY_AUTH_TOKEN + org/project are present (CI/staging).
 */
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: false,
  telemetry: false,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
