import type { DemoProduct } from "@/domain/catalogue";
import { adminListProductsDurable } from "@/lib/admin/catalogue-durable";
import { logger } from "@/lib/logger";
import { enqueueNotification } from "@/lib/notifications/outbox";
import { getRestockStore, type RestockRequest } from "@/lib/stock/restock-requests";
import { maxOrderableQuantity } from "@/lib/stock/storefront";

/** A product shoppers can order right now. */
export function isOrderableNow(product: DemoProduct): boolean {
  return (
    product.status === "published" &&
    maxOrderableQuantity({
      availability: product.availability,
      stockQuantity: product.stockQuantity,
    }) > 0
  );
}

/** Splits waiting requests into those whose product is available again and those still waiting. */
export function selectRestocked(
  requests: RestockRequest[],
  products: DemoProduct[],
): { ready: Array<{ request: RestockRequest; product: DemoProduct }> } {
  const byId = new Map(products.map((product) => [product.id, product]));
  const ready: Array<{ request: RestockRequest; product: DemoProduct }> = [];
  for (const request of requests) {
    const product = byId.get(request.productId);
    if (product && isOrderableNow(product)) ready.push({ request, product });
  }
  return { ready };
}

/**
 * Queues one branded email for every email request whose drink is available again, then marks
 * those requests done so nobody is emailed twice. Phone requests are left for staff (they see them
 * on the product page with a WhatsApp link). Returns how many emails were queued.
 */
export async function queueBackInStockNotices(): Promise<number> {
  const store = getRestockStore();
  const waiting = await store.listWaiting({ kind: "email" });
  if (waiting.length === 0) return 0;

  const { ready } = selectRestocked(waiting, await adminListProductsDurable());
  let queued = 0;
  const done: string[] = [];

  for (const { request, product } of ready) {
    try {
      const added = await enqueueNotification({
        channel: "email",
        kind: "customer_back_in_stock",
        dedupeKey: `back_in_stock:${request.id}`,
        payload: {
          email: request.contact,
          productName: product.name,
          slug: product.slug,
        },
      });
      if (added) queued += 1;
      done.push(request.id);
    } catch (error) {
      logger.error("Could not queue back-in-stock email", {
        requestId: request.id,
        error: error instanceof Error ? error.message : "unknown",
      });
    }
  }

  await store.markNotified(done, new Date());
  return queued;
}
