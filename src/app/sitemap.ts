import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";
import { listProducts } from "@/lib/catalogue";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL;
  const staticRoutes = [
    "",
    "/shop",
    "/cart",
    "/about",
    "/contact",
    "/delivery",
    "/faq",
    "/policies/privacy",
    "/policies/terms",
  ];

  const productRoutes = listProducts().map(
    (product) => `/product/${product.slug}`,
  );

  return [...staticRoutes, ...productRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
