import Link from "next/link";
import {
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { formatDemoPrice } from "@/domain/catalogue";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { listOrdersDurable } from "@/lib/orders/durable";

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const orders = await listOrdersDurable();
  const pageResult = paginateItems(orders, parseAdminPage(params.page));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Review, confirm, and fulfil customer orders."
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
          {pageResult.items.map((order) => (
            <tr key={order.id}>
              <AdminTd className="font-mono text-xs">{order.reference}</AdminTd>
              <AdminTd>
                <span className="block font-medium">{order.customerName}</span>
                <span className="text-xs text-ink-muted">
                  {order.customerPhone}
                </span>
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
      {pageResult.total === 0 ? (
        <p className="text-sm text-ink-muted">No orders yet.</p>
      ) : (
        <AdminPagination
          pathname="/admin/orders"
          searchParams={{}}
          result={pageResult}
          label="orders"
        />
      )}
    </div>
  );
}
