import type { MetadataRoute } from "next";
import { getPublicEnv, isDemoMode } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");

  if (isDemoMode()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${base}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/cart",
          "/checkout",
          "/order",
          "/admin",
          "/admin/",
          "/api/",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
