import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Avoid picking up unrelated lockfiles higher in the user profile tree.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
