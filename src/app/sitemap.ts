import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";
import { getAllProductSlugs } from "@/lib/catalogue/storefront";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL;
  // Omit cart/checkout/order/admin — private or transactional surfaces.
  const staticRoutes = [
    "",
    "/shop",
    "/about",
    "/contact",
    "/delivery",
    "/faq",
    "/policies/privacy",
    "/policies/terms",
  ];

  const slugs = await getAllProductSlugs();
  const productRoutes = slugs.map((slug) => `/product/${slug}`);

  return [...staticRoutes, ...productRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
