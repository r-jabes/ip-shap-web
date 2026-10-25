import { createHash } from "node:crypto";
import type { DemoProduct } from "@/domain/catalogue";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { isLowStockProduct } from "@/lib/admin/product-counts";
import { enqueueNotification } from "@/lib/notifications/outbox";
import type { StockLine } from "@/lib/notifications/templates/low-stock";

const MAX_LINES = 25;

function line(product: DemoProduct): StockLine {
  return { name: product.name, quantity: product.stockQuantity ?? null };
}

/** Which published products are sold out or nearly gone. Pure, so it is easy to test. */
export function findStockAlerts(products: DemoProduct[]) {
  const published = products.filter((product) => product.status === "published");
  return {
    soldOut: published
      .filter((product) => product.availability === "out_of_stock")
      .map(line),
    low: published.filter(isLowStockProduct).map(line),
  };
}

/** Same list of problems = same key, so staff are emailed again only when the list changes. */
export function stockAlertKey(alerts: ReturnType<typeof findStockAlerts>): string {
  const fingerprint = JSON.stringify([
    alerts.soldOut.map((entry) => entry.name).sort(),
    alerts.low.map((entry) => entry.name).sort(),
  ]);
  return `staff_low_stock:${createHash("sha256").update(fingerprint).digest("hex").slice(0, 16)}`;
}

/**
 * Queues a stock alert email when something is sold out or running low and staff have not already
 * been told about this exact list. Returns whether a new alert was queued.
 */
export async function queueStockAlert(): Promise<boolean> {
  const alerts = findStockAlerts(await adminListProductsDurable());
  if (alerts.soldOut.length === 0 && alerts.low.length === 0) return false;

  return enqueueNotification({
    channel: "email",
    kind: "staff_low_stock",
    dedupeKey: stockAlertKey(alerts),
    payload: {
      soldOut: alerts.soldOut.slice(0, MAX_LINES),
      low: alerts.low.slice(0, MAX_LINES),
    },
  });
}
