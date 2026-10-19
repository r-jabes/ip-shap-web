import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Avoid picking up unrelated lockfiles higher in the user profile tree.
  outputFileTracingRoot: path.join(__dirname),
  images: {
    // Temporary SVG placeholders only; replace with raster/WebP product photos later.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
