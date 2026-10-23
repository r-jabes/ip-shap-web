import type { DemoProduct } from "@/domain/catalogue";
import { isLowStockProduct } from "@/lib/admin/product-counts";
import { publishIssues } from "@/lib/admin/readiness";

/** Archived products stay out of the list unless someone asks for them. */
export const PRODUCT_FILTERS = [
  { value: "", label: "Active (hide archived)" },
  { value: "published", label: "Published only" },
  { value: "draft", label: "Drafts only" },
  { value: "low", label: "Running low" },
  { value: "soldout", label: "Sold out" },
  { value: "incomplete", label: "Missing a photo, price or category" },
  { value: "archived", label: "Archived only" },
  { value: "all", label: "Everything" },
] as const;

export type ProductSortKey = "name" | "price" | "stock" | "status";
export type SortDirection = "asc" | "desc";

export function parseProductSort(
  sort: string | undefined,
  dir: string | undefined,
): { key: ProductSortKey; dir: SortDirection } {
  const key: ProductSortKey =
    sort === "price" || sort === "stock" || sort === "status" ? sort : "name";
  return { key, dir: dir === "desc" ? "desc" : "asc" };
}

export function filterProducts(
  products: DemoProduct[],
  options: { status?: string; q?: string },
): DemoProduct[] {
  let result: DemoProduct[];
  switch (options.status) {
    case "published":
      result = products.filter((p) => p.status === "published");
      break;
    case "draft":
      result = products.filter((p) => p.status === "draft" || p.status === "demo");
      break;
    case "low":
      result = products.filter(
        (p) => p.status !== "archived" && isLowStockProduct(p),
      );
      break;
    case "soldout":
      result = products.filter(
        (p) => p.status !== "archived" && p.availability === "out_of_stock",
      );
      break;
    case "incomplete":
      result = products.filter(
        (p) => p.status !== "archived" && publishIssues(p).length > 0,
      );
      break;
    case "archived":
      result = products.filter((p) => p.status === "archived");
      break;
    case "all":
      result = products;
      break;
    default:
      result = products.filter((p) => p.status !== "archived");
  }

  const q = (options.q ?? "").trim().toLowerCase();
  if (!q) return result;
  return result.filter((product) =>
    [
      product.name,
      product.slug,
      product.brandName,
      product.sku ?? "",
      product.barcode ?? "",
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function sortProducts(
  products: DemoProduct[],
  key: ProductSortKey,
  dir: SortDirection,
): DemoProduct[] {
  const sign = dir === "desc" ? -1 : 1;
  const value = (product: DemoProduct): number | string => {
    switch (key) {
      case "price":
        return product.price.amount;
      case "stock":
        // Untracked stock sorts last when ascending.
        return product.stockQuantity ?? Number.POSITIVE_INFINITY;
      case "status":
        return product.status;
      default:
        return product.name.toLowerCase();
    }
  };
  return [...products].sort((a, b) => {
    const left = value(a);
    const right = value(b);
    if (left < right) return -1 * sign;
    if (left > right) return 1 * sign;
    return a.name.localeCompare(b.name);
  });
}
