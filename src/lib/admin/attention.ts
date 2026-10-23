import type { DemoProduct } from "@/domain/catalogue";
import { isLowStockProduct } from "@/lib/admin/product-counts";
import { publishIssues } from "@/lib/admin/readiness";
import { UNPAID_HOLD_DAYS } from "@/lib/orders/hold-policy";

export type AttentionItem = {
  key: string;
  /** Plain-English line, already pluralised. */
  label: string;
  count: number;
  href: string;
  tone: "urgent" | "warn";
};

type OrderLike = {
  fulfilmentStatus: string;
  paymentStatus: string;
  createdAt: string;
};

const DAY = 24 * 60 * 60 * 1000;

function plural(count: number, one: string, many: string) {
  return `${count} ${count === 1 ? one : many}`;
}

/**
 * The to-do list shown at the top of the dashboard: only things that need a person, most urgent
 * first. An empty list means there is nothing to do.
 */
export function buildAttention(
  products: DemoProduct[],
  orders: OrderLike[],
  now: Date,
): AttentionItem[] {
  const items: AttentionItem[] = [];

  const awaiting = orders.filter(
    (order) => order.fulfilmentStatus === "awaiting_confirmation",
  );
  // Orders get cancelled automatically after UNPAID_HOLD_DAYS; warn one day before.
  const warnAfter = (UNPAID_HOLD_DAYS - 1) * DAY;
  const expiring = awaiting.filter(
    (order) =>
      order.paymentStatus !== "paid" &&
      now.getTime() - new Date(order.createdAt).getTime() >= warnAfter,
  );
  if (expiring.length > 0) {
    items.push({
      key: "orders-expiring",
      label: `${plural(expiring.length, "order has", "orders have")} waited almost ${UNPAID_HOLD_DAYS} days — confirm or they will be cancelled and the stock released`,
      count: expiring.length,
      href: "/admin/orders?fulfilment=awaiting_confirmation&sort=oldest",
      tone: "urgent",
    });
  }
  const fresh = awaiting.length - expiring.length;
  if (fresh > 0) {
    items.push({
      key: "orders-new",
      label: `${plural(fresh, "new order is", "new orders are")} waiting for you to confirm`,
      count: fresh,
      href: "/admin/orders?fulfilment=awaiting_confirmation",
      tone: "urgent",
    });
  }

  const live = products.filter((product) => product.status !== "archived");
  const published = live.filter((product) => product.status === "published");

  const soldOut = published.filter((p) => p.availability === "out_of_stock");
  if (soldOut.length > 0) {
    items.push({
      key: "sold-out",
      label: `${plural(soldOut.length, "published product is", "published products are")} sold out`,
      count: soldOut.length,
      href: "/admin/products?status=soldout",
      tone: "warn",
    });
  }

  const low = published.filter(isLowStockProduct);
  if (low.length > 0) {
    items.push({
      key: "low-stock",
      label: `${plural(low.length, "product is", "products are")} running low`,
      count: low.length,
      href: "/admin/products?status=low",
      tone: "warn",
    });
  }

  const incomplete = published.filter(
    (product) => publishIssues(product).length > 0,
  );
  if (incomplete.length > 0) {
    items.push({
      key: "incomplete",
      label: `${plural(incomplete.length, "published product is", "published products are")} missing a photo, price or category`,
      count: incomplete.length,
      href: "/admin/products?status=incomplete",
      tone: "warn",
    });
  }

  return items;
}
