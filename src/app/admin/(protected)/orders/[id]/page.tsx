import { notFound } from "next/navigation";
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatus,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { WhatsAppIcon } from "@/components/ui/icons";
import {
  adminMarkPaymentAction,
  adminTransitionFulfilmentAction,
} from "@/app/admin/order-actions";
import { formatDemoPrice } from "@/domain/catalogue";
import {
  customerTelHref,
  customerWhatsAppHref,
} from "@/lib/orders/customer-contact";
import { getOrderByIdDurable } from "@/lib/orders/durable";

type Params = Promise<{ id: string }>;

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Promise<{ updated?: string; paid?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
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

      {query.updated || query.paid ? (
        <AdminStatus>
          {query.paid ? "Payment recorded." : "Order updated."}
        </AdminStatus>
      ) : null}

      <AdminPanel>
        <h2 className="font-display text-xl">Message customer</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Opens a link to the customer&apos;s phone — not the shop Contact us
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
            ["Fulfilment", order.fulfilmentStatus],
            ["Payment", order.paymentStatus],
            ["Total", formatDemoPrice(order.total)],
            [
              "Delivery fee",
              order.deliveryFee
                ? formatDemoPrice(order.deliveryFee)
                : "Unavailable / manual",
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
        <h2 className="font-display text-xl">Lines</h2>
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

      <section className="grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <form action={adminTransitionFulfilmentAction} className="space-y-4">
            <h2 className="font-display text-xl">Fulfilment</h2>
            <input type="hidden" name="orderId" value={order.id} />
            <Field id="fulfilment-to" label="Next status">
              <Select
                id="fulfilment-to"
                name="to"
                defaultValue="confirmed"
              >
                <option value="confirmed">confirmed</option>
                <option value="processing">processing</option>
                <option value="ready_for_dispatch">ready_for_dispatch</option>
                <option value="out_for_delivery">out_for_delivery</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </Select>
            </Field>
            <Field id="fulfilment-reason" label="Reason">
              <Input id="fulfilment-reason" name="reason" required />
            </Field>
            <Button type="submit" variant="secondary" size="md">
              Apply fulfilment change
            </Button>
          </form>
        </AdminPanel>

        <AdminPanel>
          <form action={adminMarkPaymentAction} className="space-y-4">
            <h2 className="font-display text-xl">Record verified payment</h2>
            <p className="text-xs text-ink-muted">
              Use only after offline verification (bank/MoMo slip, etc.).
              Reference and reason are required.
            </p>
            <input type="hidden" name="orderId" value={order.id} />
            <Field id="payment-ref" label="Payment reference">
              <Input id="payment-ref" name="paymentReference" required />
            </Field>
            <Field id="payment-reason" label="Reason / method note">
              <Input id="payment-reason" name="reason" required />
            </Field>
            <Button
              type="submit"
              variant="ghost"
              size="md"
              disabled={order.paymentStatus === "paid"}
            >
              Mark paid
            </Button>
          </form>
        </AdminPanel>
      </section>

      <AdminPanel>
        <h2 className="font-display text-xl">Timeline</h2>
        <ul className="mt-4 space-y-2 text-sm text-ink-muted">
          {order.statusHistory.map((entry, index) => (
            <li key={`${entry.at}-${index}`}>
              <span className="tabular text-brand-charcoal">{entry.at}</span>
              : {entry.from ?? "—"} → {entry.to} — {entry.reason}
            </li>
          ))}
        </ul>
      </AdminPanel>
    </div>
  );
}
