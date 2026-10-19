import Link from "next/link";
import { formatDemoPrice } from "@/domain/catalogue";
import { listOrders } from "@/lib/orders/store";

export default function AdminOrdersPage() {
  const orders = listOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Orders</h1>
        <p className="mt-2 text-sm text-brand-dark-neutral">
          Confirm WhatsApp-assisted orders, record verified payments, and
          advance fulfilment. Payment is never assumed from a browser redirect.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-brand-dark-neutral/20 text-xs uppercase">
            <tr>
              <th className="py-2 pr-3">Reference</th>
              <th className="py-2 pr-3">Channel</th>
              <th className="py-2 pr-3">Fulfilment</th>
              <th className="py-2 pr-3">Payment</th>
              <th className="py-2 pr-3">Total</th>
              <th className="py-2">Open</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-brand-dark-neutral/10"
              >
                <td className="py-3 pr-3 font-mono text-xs">
                  {order.reference}
                </td>
                <td className="py-3 pr-3">{order.channel}</td>
                <td className="py-3 pr-3">{order.fulfilmentStatus}</td>
                <td className="py-3 pr-3">{order.paymentStatus}</td>
                <td className="py-3 pr-3">{formatDemoPrice(order.total)}</td>
                <td className="py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="underline underline-offset-4"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 ? (
          <p className="mt-6 text-sm text-brand-dark-neutral">
            No orders yet. Place a checkout order from the storefront to test.
          </p>
        ) : null}
      </div>
    </div>
  );
}
