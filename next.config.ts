import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Avoid picking up unrelated lockfiles higher in the user profile tree.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Prefer modern formats when the optimizer can produce them; JPEG/PNG remain fallbacks.
    formats: ["image/avif", "image/webp"],
    // Temporary SVG placeholders for fallback testing only.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
