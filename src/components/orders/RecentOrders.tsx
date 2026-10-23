"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  rememberedOrderStatusesAction,
  type RememberedOrderStatus,
} from "@/app/(storefront)/checkout/actions";
import { ReorderButton } from "@/components/orders/ReorderButton";
import {
  forgetOrder,
  ORDERS_STORAGE_KEY,
  parseRememberedOrders,
} from "@/lib/device/recent-orders";
import { readDevice, writeDevice } from "@/lib/device/storage";
import { useDeviceValue } from "@/lib/device/use-device-value";
import { formatRwf } from "@/lib/money";
import { customerStatusLabel } from "@/lib/orders/customer-status";

/**
 * The last few orders placed from this device, with their current status. Stored in the browser
 * only; each order is checked with its own private token, so nothing else is revealed.
 */
export function RecentOrders() {
  const raw = useDeviceValue(ORDERS_STORAGE_KEY);
  const orders = useMemo(() => parseRememberedOrders(raw), [raw]);
  const [statuses, setStatuses] = useState<Record<string, RememberedOrderStatus>>(
    {},
  );

  // Look up current statuses whenever the remembered list changes.
  const signature = orders.map((order) => `${order.reference}:${order.token}`).join("|");
  useEffect(() => {
    if (orders.length === 0) return;
    let cancelled = false;
    void rememberedOrderStatusesAction(
      orders.map(({ reference, token }) => ({ reference, token })),
    ).then((results) => {
      if (cancelled) return;
      setStatuses(Object.fromEntries(results.map((result) => [result.reference, result])));
      // Forget orders that no longer exist.
      const gone = results.filter((result) => !result.found).map((r) => r.reference);
      if (gone.length > 0) {
        let list = parseRememberedOrders(readDevice(ORDERS_STORAGE_KEY));
        for (const reference of gone) list = forgetOrder(list, reference);
        writeDevice(ORDERS_STORAGE_KEY, JSON.stringify(list));
      }
    });
    return () => {
      cancelled = true;
    };
    // `signature` captures the list contents; `orders` itself changes identity on every read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (orders.length === 0) return null;

  return (
    <section
      aria-labelledby="recent-orders-heading"
      className="mt-8 max-w-2xl rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-5 shadow-[4px_4px_0_0_var(--brand-charcoal)] sm:p-6"
    >
      <h2 id="recent-orders-heading" className="font-display text-xl">
        Your recent orders
      </h2>
      <p className="mt-1 text-sm text-ink-muted">
        Remembered on this device only.
      </p>
      <ul className="mt-4 divide-y divide-brand-charcoal/10">
        {orders.map((order) => {
          const status = statuses[order.reference];
          return (
            <li
              key={order.reference}
              className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/order/${encodeURIComponent(order.reference)}?token=${encodeURIComponent(order.token)}`}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  {order.reference}
                </Link>
                <p className="text-sm text-ink-muted">
                  {new Date(order.placedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {formatRwf(order.totalRwf)}
                  {status?.found && status.fulfilmentStatus
                    ? ` · ${customerStatusLabel(status.fulfilmentStatus)}`
                    : ""}
                </p>
              </div>
              <div className="flex items-start gap-3">
                {status?.found && status.items && status.items.length > 0 ? (
                  <ReorderButton items={status.items} size="sm" variant="secondary" />
                ) : null}
                <button
                  type="button"
                  className="min-h-10 text-sm text-ink-muted underline underline-offset-4 hover:text-brand-charcoal"
                  onClick={() => {
                    const next = forgetOrder(
                      parseRememberedOrders(readDevice(ORDERS_STORAGE_KEY)),
                      order.reference,
                    );
                    writeDevice(ORDERS_STORAGE_KEY, JSON.stringify(next));
                  }}
                  aria-label={`Remove order ${order.reference} from this device`}
                >
                  Remove
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
