import type { MetadataRoute } from "next";
import { getPublicEnv } from "@/lib/env";
import { listProductsDurable } from "@/lib/catalogue";

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

  const products = await listProductsDurable();
  const productRoutes = products.map((product) => `/product/${product.slug}`);

  return [...staticRoutes, ...productRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));
}
