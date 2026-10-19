import Link from "next/link";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { formatDemoPrice } from "@/domain/catalogue";
import { listOrders } from "@/lib/orders/store";

export default function AdminOrdersPage() {
  const orders = listOrders();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Confirm WhatsApp-assisted orders, record verified payments, and advance fulfilment. Payment is never assumed from a browser redirect."
      />

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Reference</AdminTh>
            <AdminTh>Channel</AdminTh>
            <AdminTh>Fulfilment</AdminTh>
            <AdminTh>Payment</AdminTh>
            <AdminTh>Total</AdminTh>
            <AdminTh>Open</AdminTh>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <AdminTd className="font-mono text-xs">{order.reference}</AdminTd>
              <AdminTd>{order.channel}</AdminTd>
              <AdminTd>{order.fulfilmentStatus}</AdminTd>
              <AdminTd>{order.paymentStatus}</AdminTd>
              <AdminTd className="tabular">
                {formatDemoPrice(order.total)}
              </AdminTd>
              <AdminTd>
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-semibold underline decoration-2 underline-offset-4 decoration-brand-burnt-orange"
                >
                  Open
                </Link>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>
      {orders.length === 0 ? (
        <p className="text-sm text-ink-muted">
          No orders yet. Place a checkout order from the storefront to test.
        </p>
      ) : null}
    </div>
  );
}
