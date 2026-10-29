import type { MetadataRoute } from "next";
import { getCachedCategories } from "@/lib/catalogue/cache";
import { getAllProductSlugs } from "@/lib/catalogue/storefront";
import { getPublicEnv } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const now = new Date();

  // Omit cart/checkout/order/admin/saved — private or transactional surfaces.
  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/shop", changeFrequency: "daily", priority: 0.9 },
    { path: "/about", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.7 },
    { path: "/delivery", changeFrequency: "monthly", priority: 0.5 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.5 },
    { path: "/policies/privacy", changeFrequency: "yearly", priority: 0.2 },
    { path: "/policies/terms", changeFrequency: "yearly", priority: 0.2 },
  ];

  const [slugs, categories] = await Promise.all([
    getAllProductSlugs(),
    getCachedCategories().catch(() => [] as Awaited<
      ReturnType<typeof getCachedCategories>
    >),
  ]);

  const categoryRoutes = categories.map((category) => ({
    url: `${base}/shop?category=${encodeURIComponent(category.slug)}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const productRoutes = slugs.map((slug) => ({
    url: `${base}/product/${slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [
    ...staticRoutes.map((route) => ({
      url: `${base}${route.path}`,
      lastModified: now,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    })),
    ...categoryRoutes,
    ...productRoutes,
  ];
}
