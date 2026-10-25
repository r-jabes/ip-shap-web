import Link from "next/link";
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { formatDemoPrice } from "@/domain/catalogue";
import { FulfilmentModal } from "@/components/admin/OrderModals";
import {
  FulfilmentBadge,
  PaymentBadge,
} from "@/components/admin/OrderStatusBadge";
import {
  filterAndSortOrders,
  formatOrderPlacedAt,
  ORDER_FULFILMENT_FILTERS,
  ORDER_PAYMENT_FILTERS,
  ORDER_SORT_OPTIONS,
  parseFulfilmentFilter,
  parseOrderSort,
  parsePaymentFilter,
} from "@/lib/admin/orders-query";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { listOrdersDurable } from "@/lib/orders/durable";
import type { StoredOrder } from "@/lib/orders/store";
import { nextFulfilmentStatuses } from "@/lib/orders/transitions";

/** Change an order's status straight from the list, jumping to any valid step. */
function QuickStatusButton({ order }: { order: StoredOrder }) {
  const options = nextFulfilmentStatuses(
    order.fulfilmentStatus,
    order.fulfillmentMethod,
  );
  if (options.length === 0) return null;
  return (
    <FulfilmentModal
      orderId={order.id}
      reference={order.reference}
      current={order.fulfilmentStatus}
      method={order.fulfillmentMethod}
      options={options}
      triggerLabel="Change status"
      triggerVariant="secondary"
    />
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    fulfilment?: string;
    payment?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const fulfilment = parseFulfilmentFilter(params.fulfilment);
  const payment = parsePaymentFilter(params.payment);
  const sort = parseOrderSort(params.sort);

  const allOrders = await listOrdersDurable();
  const filtered = filterAndSortOrders(allOrders, {
    q,
    fulfilment,
    payment,
    sort,
  });
  const pageResult = paginateItems(filtered, parseAdminPage(params.page));
  const query = {
    q: params.q,
    fulfilment: params.fulfilment,
    payment: params.payment,
    sort: sort === "newest" ? undefined : sort,
  };
  const hasFilters = Boolean(q || fulfilment || payment || sort !== "newest");

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Orders"
        description="Find, review, and fulfil customer orders."
      />

      <form className="grid gap-3 rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15 bg-white/40 p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="min-w-0 sm:col-span-2 lg:col-span-2">
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
            htmlFor="admin-order-q"
          >
            Search
          </label>
          <Input
            id="admin-order-q"
            name="q"
            defaultValue={params.q}
            placeholder="Reference, name, or phone"
            pill
          />
        </div>
        <div className="min-w-0">
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
            htmlFor="admin-order-fulfilment"
          >
            Fulfilment
          </label>
          <Select
            id="admin-order-fulfilment"
            name="fulfilment"
            defaultValue={fulfilment}
          >
            {ORDER_FULFILMENT_FILTERS.map((option) => (
              <option key={option.value || "all-fulfilment"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-0">
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
            htmlFor="admin-order-payment"
          >
            Payment
          </label>
          <Select
            id="admin-order-payment"
            name="payment"
            defaultValue={payment}
          >
            {ORDER_PAYMENT_FILTERS.map((option) => (
              <option key={option.value || "all-payment"} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="min-w-0">
          <label
            className="mb-1.5 block text-xs font-semibold tracking-wide text-ink-muted uppercase"
            htmlFor="admin-order-sort"
          >
            Sort
          </label>
          <Select id="admin-order-sort" name="sort" defaultValue={sort}>
            {ORDER_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
          <Button type="submit" variant="ghost" size="md">
            Apply
          </Button>
          {hasFilters ? (
            <Button href="/admin/orders" variant="link" size="sm">
              Clear
            </Button>
          ) : null}
        </div>
      </form>

      <AdminTable
        mobile={pageResult.items.map((order) => (
          <AdminCard key={order.id}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-xs">{order.reference}</p>
                <p className="mt-1 font-semibold">{order.customerName}</p>
                <p className="text-xs text-ink-muted">{order.customerPhone}</p>
              </div>
              <p className="tabular font-semibold">
                {formatDemoPrice(order.total)}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <FulfilmentBadge status={order.fulfilmentStatus} />
              <PaymentBadge status={order.paymentStatus} withPrefix />
            </div>
            <p className="mt-2 text-xs text-ink-muted">
              {formatOrderPlacedAt(order.createdAt)}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <QuickStatusButton order={order} />
              <Link
                href={`/admin/orders/${order.id}`}
                className="inline-flex h-9 items-center rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-3.5 text-sm font-semibold shadow-[2px_2px_0_0_var(--brand-charcoal)]"
              >
                Open
              </Link>
            </div>
          </AdminCard>
        ))}
      >
        <thead>
          <tr>
            <AdminTh>Placed</AdminTh>
            <AdminTh>Reference</AdminTh>
            <AdminTh>Customer</AdminTh>
            <AdminTh>Fulfilment</AdminTh>
            <AdminTh>Payment</AdminTh>
            <AdminTh>Total</AdminTh>
            <AdminTh>
              <span className="sr-only">Actions</span>
            </AdminTh>
          </tr>
        </thead>
        <tbody>
          {pageResult.items.map((order) => (
            <tr key={order.id}>
              <AdminTd className="whitespace-nowrap text-xs tabular text-ink-muted">
                {formatOrderPlacedAt(order.createdAt)}
              </AdminTd>
              <AdminTd className="font-mono text-xs">{order.reference}</AdminTd>
              <AdminTd>
                <span className="block font-medium">{order.customerName}</span>
                <span className="text-xs text-ink-muted">
                  {order.customerPhone}
                </span>
              </AdminTd>
              <AdminTd>
                <FulfilmentBadge status={order.fulfilmentStatus} />
              </AdminTd>
              <AdminTd>
                <PaymentBadge status={order.paymentStatus} />
              </AdminTd>
              <AdminTd className="tabular">
                {formatDemoPrice(order.total)}
              </AdminTd>
              <AdminTd>
                <div className="flex items-center gap-2">
                  <QuickStatusButton order={order} />
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="inline-flex h-9 items-center rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-3.5 text-sm font-semibold shadow-[2px_2px_0_0_var(--brand-charcoal)]"
                  >
                    Open
                  </Link>
                </div>
              </AdminTd>
            </tr>
          ))}
        </tbody>
      </AdminTable>

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            {hasFilters
              ? "No orders match these filters."
              : "No orders yet."}
          </p>
          {hasFilters ? (
            <div className="mt-4">
              <Button href="/admin/orders" variant="ghost" size="sm">
                Clear filters
              </Button>
            </div>
          ) : null}
        </div>
      ) : (
        <AdminPagination
          pathname="/admin/orders"
          searchParams={query}
          result={pageResult}
          label="orders"
        />
      )}
    </div>
  );
}
