import path from "node:path";
import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security/headers";

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

export default nextConfig;
