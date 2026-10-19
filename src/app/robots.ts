import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL;
  return {
    rules: {
      userAgent: "*",
      // Prototype should not be indexed until launch content is confirmed.
      disallow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
