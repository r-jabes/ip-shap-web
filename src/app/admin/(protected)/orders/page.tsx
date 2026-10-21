import Link from "next/link";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { formatDemoPrice } from "@/domain/catalogue";
import { listOrdersDurable } from "@/lib/orders/durable";

export default async function AdminOrdersPage() {
  const orders = await listOrdersDurable();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Confirm new orders, record verified payments, and advance fulfilment. Payment is never assumed from a browser redirect."
      />

      <AdminTable>
        <thead>
          <tr>
            <AdminTh>Reference</AdminTh>
            <AdminTh>Customer</AdminTh>
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
              <AdminTd>
                <span className="block font-medium">{order.customerName}</span>
                <span className="text-xs text-ink-muted">{order.customerPhone}</span>
              </AdminTd>
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
