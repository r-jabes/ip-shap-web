import type { DemoProduct } from "@/domain/catalogue";

/**
 * Things still missing before a product should appear in the shop. Returned in plain English so
 * the admin can show them as-is. An empty list means it is ready to publish.
 */
export function publishIssues(
  product: Pick<DemoProduct, "price" | "images" | "categorySlug" | "name">,
): string[] {
  const issues: string[] = [];
  if (!product.name.trim()) issues.push("Add a name");
  if (!(product.price.amount > 0)) issues.push("Add a price");
  if (product.images.length === 0) issues.push("Add a photo");
  if (!product.categorySlug || product.categorySlug === "uncategorised") {
    issues.push("Choose a category");
  }
  return issues;
}
