import { listAuditsDurable } from "@/lib/admin/audit-durable";
import { buildAttention } from "@/lib/admin/attention";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import {
  computeProductCounts,
  isLowStockProduct,
} from "@/lib/admin/product-counts";
import { listOrdersDurable } from "@/lib/orders/durable";
import { listAdjustmentsDurable } from "@/lib/stock/durable";

/** Dashboard data from the same source as the Products page (database when configured). */
export async function loadAdminDashboard() {
  const [products, adjustments, audits, orders] = await Promise.all([
    adminListProductsDurable(),
    listAdjustmentsDurable(5),
    listAuditsDurable(8),
    // Only recent orders matter for the to-do list.
    listOrdersDurable({
      since: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      limit: 200,
    }),
  ]);

  const names = new Map(products.map((product) => [product.id, product.name]));
  return {
    counts: computeProductCounts(products),
    attention: buildAttention(products, orders, new Date()),
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
