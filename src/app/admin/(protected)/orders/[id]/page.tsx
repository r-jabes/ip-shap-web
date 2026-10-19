import { notFound } from "next/navigation";
import {
  adminMarkPaymentAction,
  adminTransitionFulfilmentAction,
} from "@/app/admin/order-actions";
import { formatDemoPrice } from "@/domain/catalogue";
import { getOrderById } from "@/lib/orders/store";

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
  const order = getOrderById(id);
  if (!order) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">{order.reference}</h1>
        <p className="mt-2 text-sm text-brand-dark-neutral">
          {order.customerName} · {order.customerPhone} · {order.channel}
        </p>
        {query.updated || query.paid ? (
          <p className="mt-2 text-sm" role="status">
            {query.paid ? "Payment recorded." : "Order updated."}
          </p>
        ) : null}
      </div>

      <ul className="grid gap-3 text-sm sm:grid-cols-2">
        <li className="border border-brand-dark-neutral/20 px-4 py-3">
          Fulfilment: <strong>{order.fulfilmentStatus}</strong>
        </li>
        <li className="border border-brand-dark-neutral/20 px-4 py-3">
          Payment: <strong>{order.paymentStatus}</strong>
        </li>
        <li className="border border-brand-dark-neutral/20 px-4 py-3">
          Total: <strong>{formatDemoPrice(order.total)}</strong>
        </li>
        <li className="border border-brand-dark-neutral/20 px-4 py-3">
          Delivery fee:{" "}
          <strong>
            {order.deliveryFee
              ? formatDemoPrice(order.deliveryFee)
              : "Unavailable / manual"}
          </strong>
        </li>
      </ul>

      <section>
        <h2 className="font-display text-xl">Lines</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((item) => (
            <li key={`${item.productId}-${item.productSlug}`}>
              {item.quantity} × {item.productName} —{" "}
              {formatDemoPrice(item.lineTotal)}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          action={adminTransitionFulfilmentAction}
          className="space-y-3 border border-brand-dark-neutral/20 p-4"
        >
          <h2 className="font-display text-xl">Fulfilment</h2>
          <input type="hidden" name="orderId" value={order.id} />
          <label className="grid gap-1 text-sm">
            Next status
            <select
              name="to"
              className="border border-brand-dark-neutral/30 px-3 py-2"
              defaultValue="confirmed"
            >
              <option value="confirmed">confirmed</option>
              <option value="processing">processing</option>
              <option value="ready_for_dispatch">ready_for_dispatch</option>
              <option value="out_for_delivery">out_for_delivery</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Reason
            <input
              name="reason"
              required
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white"
          >
            Apply fulfilment change
          </button>
        </form>

        <form
          action={adminMarkPaymentAction}
          className="space-y-3 border border-brand-dark-neutral/20 p-4"
        >
          <h2 className="font-display text-xl">Record verified payment</h2>
          <p className="text-xs text-brand-dark-neutral">
            Use only after offline verification (bank/MoMo slip, etc.).
            Reference and reason are required.
          </p>
          <input type="hidden" name="orderId" value={order.id} />
          <label className="grid gap-1 text-sm">
            Payment reference
            <input
              name="paymentReference"
              required
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Reason / method note
            <input
              name="reason"
              required
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            className="border border-brand-charcoal px-4 py-2 text-sm"
            disabled={order.paymentStatus === "paid"}
          >
            Mark paid
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-display text-xl">Timeline</h2>
        <ul className="mt-3 space-y-2 text-sm text-brand-dark-neutral">
          {order.statusHistory.map((entry, index) => (
            <li key={`${entry.at}-${index}`}>
              {entry.at}: {entry.from ?? "—"} → {entry.to} — {entry.reason}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
