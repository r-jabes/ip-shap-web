import { notFound } from "next/navigation";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-ui";
import {
  FulfilmentModal,
  PaymentModal,
} from "@/components/admin/OrderModals";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatDemoPrice } from "@/domain/catalogue";
import { formatAdminDateTime } from "@/lib/admin/format";
import {
  formatFulfilmentLabel,
  formatPaymentLabel,
} from "@/lib/admin/orders-query";
import { nextFulfilmentStatuses } from "@/lib/orders/transitions";
import {
  customerTelHref,
  customerWhatsAppHref,
} from "@/lib/orders/customer-contact";
import { getOrderByIdDurable } from "@/lib/orders/durable";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const order = await getOrderByIdDurable(id);
  if (!order) notFound();

  const customerWa = customerWhatsAppHref(
    order.customerPhone,
    `Hello ${order.customerName}, regarding your order ${order.reference}…`,
  );
  const customerTel = customerTelHref(order.customerPhone);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={order.reference}
        description={`${order.customerName} · ${order.customerPhone} · ${order.channel}`}
        actions={
          <Button href="/admin/orders" variant="ghost" size="sm">
            All orders
          </Button>
        }
      />

      <AdminPanel>
        <h2 className="font-display text-xl">Message customer</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Opens the customer&apos;s own phone number, not the shop contact
          number.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {customerWa ? (
            <Button
              href={customerWa}
              variant="secondary"
              size="sm"
              iconLeft={<WhatsAppIcon size={16} />}
            >
              WhatsApp customer
            </Button>
          ) : null}
          {customerTel ? (
            <Button href={customerTel} variant="ghost" size="sm">
              Call customer
            </Button>
          ) : null}
          {!customerWa && !customerTel ? (
            <p className="text-sm text-ink-muted">No usable customer phone.</p>
          ) : null}
        </div>
      </AdminPanel>

      <ul className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
        {(
          [
            ["Order status", formatFulfilmentLabel(order.fulfilmentStatus)],
            ["Payment", formatPaymentLabel(order.paymentStatus)],
            ["Total", formatDemoPrice(order.total)],
            [
              "Delivery fee",
              order.deliveryFee
                ? formatDemoPrice(order.deliveryFee)
                : "To be confirmed",
            ],
          ] as const
        ).map(([label, value]) => (
          <li
            key={label}
            className="rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15 bg-white/50 px-4 py-3"
          >
            <p className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
              {label}
            </p>
            <p className="mt-1.5 font-semibold text-brand-charcoal">{value}</p>
          </li>
        ))}
      </ul>

      <AdminPanel>
        <h2 className="font-display text-xl">Items</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {order.items.map((item) => (
            <li
              key={`${item.productId}-${item.productSlug}`}
              className="flex flex-wrap justify-between gap-2 border-t border-brand-charcoal/10 pt-2 first:border-t-0 first:pt-0"
            >
              <span>
                {item.quantity} × {item.productName}
              </span>
              <span className="tabular font-medium">
                {formatDemoPrice(item.lineTotal)}
              </span>
            </li>
          ))}
        </ul>
      </AdminPanel>

      <div className="flex flex-wrap gap-2">
        <FulfilmentModal
          orderId={order.id}
          options={nextFulfilmentStatuses(order.fulfilmentStatus).map(
            (status) => ({ value: status, label: formatFulfilmentLabel(status) }),
          )}
        />
        <PaymentModal
          orderId={order.id}
          alreadyPaid={order.paymentStatus === "paid"}
        />
      </div>

      <AdminPanel>
        <h2 className="font-display text-xl">History</h2>
        <ul className="mt-4 space-y-2 text-sm text-ink-muted">
          {order.statusHistory.map((entry, index) => (
            <li key={`${entry.at}-${index}`}>
              <span className="tabular text-brand-charcoal">
                {formatAdminDateTime(entry.at)}
              </span>
              : {entry.from ? formatFulfilmentLabel(entry.from) : "Placed"} →{" "}
              {formatFulfilmentLabel(entry.to)} — {entry.reason}
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
