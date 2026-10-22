import { listAuditsDurable } from "@/lib/admin/audit-durable";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import {
  computeProductCounts,
  isLowStockProduct,
} from "@/lib/admin/product-counts";
import { listAdjustmentsDurable } from "@/lib/stock/durable";

/** Dashboard data from the same source as the Products page (database when configured). */
export async function loadAdminDashboard() {
  const [products, adjustments, audits] = await Promise.all([
    adminListProductsDurable(),
    listAdjustmentsDurable(5),
    listAuditsDurable(8),
  ]);

  const names = new Map(products.map((product) => [product.id, product.name]));
  return {
    counts: computeProductCounts(products),
    lowStock: products
      .filter((product) => product.status !== "archived")
      .filter(isLowStockProduct)
      .slice(0, 8),
    adjustments: adjustments.map((row) => ({
      ...row,
      productName: names.get(row.productId) ?? "A product",
    })),
    audits,
  };
}
