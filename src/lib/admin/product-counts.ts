import type { DemoProduct } from "@/domain/catalogue";
import { isLowStockItem } from "@/lib/stock/engine";

export type ProductCounts = {
  totalProducts: number;
  published: number;
  draft: number;
  archived: number;
  unknownStock: number;
  outOfStock: number;
  lowStock: number;
};

export function isLowStockProduct(product: DemoProduct): boolean {
  return isLowStockItem({
    availability: product.availability,
    quantity: product.stockQuantity,
  });
}

/** "Total" excludes archived products, so it matches what the Products page shows by default. */
export function computeProductCounts(products: DemoProduct[]): ProductCounts {
  const live = products.filter((product) => product.status !== "archived");
  return {
    totalProducts: live.length,
    published: live.filter((p) => p.status === "published").length,
    draft: live.filter((p) => p.status === "draft" || p.status === "demo")
      .length,
    archived: products.length - live.length,
    unknownStock: live.filter((p) => p.availability === "unknown").length,
    outOfStock: live.filter((p) => p.availability === "out_of_stock").length,
    lowStock: live.filter(isLowStockProduct).length,
  };
}
