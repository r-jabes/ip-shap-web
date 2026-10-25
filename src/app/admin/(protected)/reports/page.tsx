import {
  AdminPageHeader,
  AdminPanel,
  AdminStat,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { formatDemoPrice } from "@/domain/catalogue";
import { buildSalesReport } from "@/lib/admin/reports";
import { moneyRwf } from "@/lib/money";
import { listOrdersDurable } from "@/lib/orders/durable";

const RANGES = [7, 30, 90] as const;

function rwf(amount: number) {
  return formatDemoPrice(moneyRwf(amount));
}

function dayLabel(day: string) {
  return new Date(`${day}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    weekday: "short",
    timeZone: "UTC",
  });
}

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const requested = Number(params.days);
  const days = (RANGES as readonly number[]).includes(requested)
    ? requested
    : 30;

  const now = new Date();
  // One extra day of slack so the earliest Kigali day is never cut off by the time-zone offset.
  const since = new Date(now.getTime() - (days + 1) * 24 * 60 * 60 * 1000);
  const orders = await listOrdersDurable({ since, limit: 1000 });
  const report = buildSalesReport(orders, now, days);
  const busiest = Math.max(1, ...report.days.map((row) => row.sales));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Reports"
        description="Sales and best-sellers from the orders you have received. Cancelled orders are not counted."
        actions={
          <>
            <Button
              href={`/admin/export/orders?days=${days}`}
              variant="ghost"
              size="sm"
            >
              Download orders (CSV)
            </Button>
            <Button href="/admin/export/products" variant="ghost" size="sm">
              Download products (CSV)
            </Button>
          </>
        }
      />

      <nav aria-label="Report period" className="flex flex-wrap gap-2">
        {RANGES.map((range) => (
          <Button
            key={range}
            href={`/admin/reports?days=${range}`}
            variant={range === days ? "primary" : "ghost"}
            size="sm"
            aria-current={range === days ? "true" : undefined}
          >
            Last {range} days
          </Button>
        ))}
      </nav>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStat label="Orders" value={report.totals.orders} />
        <AdminStat label="Sales" value={rwf(report.totals.sales)} />
        <AdminStat label="Money received" value={rwf(report.totals.received)} />
        <AdminStat
          label="Average order"
          value={rwf(report.totals.averageOrder)}
        />
      </ul>
      {report.totals.cancelled > 0 ? (
        <p className="text-sm text-ink-muted">
          {report.totals.cancelled} cancelled{" "}
          {report.totals.cancelled === 1 ? "order is" : "orders are"} left out
          of these figures.
        </p>
      ) : null}

      <AdminPanel>
        <h2 className="font-display text-xl">Sales by day</h2>
        {report.totals.orders === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            No orders in this period yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-1.5 text-sm">
            {[...report.days].reverse().map((row) => (
              <li
                key={row.day}
                className="grid grid-cols-[6.5rem_minmax(0,1fr)_auto] items-center gap-3"
              >
                <span className="text-ink-muted tabular">
                  {dayLabel(row.day)}
                </span>
                <span
                  className="h-3 rounded-full bg-brand-charcoal/10"
                  aria-hidden="true"
                >
                  <span
                    className="block h-3 rounded-full bg-brand-burnt-orange"
                    style={{ width: `${(row.sales / busiest) * 100}%` }}
                  />
                </span>
                <span className="text-right tabular">
                  {row.orders > 0 ? (
                    <>
                      {rwf(row.sales)}{" "}
                      <span className="text-ink-muted">
                        · {row.orders} {row.orders === 1 ? "order" : "orders"}
                      </span>
                    </>
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel>
        <h2 className="font-display text-xl">Best sellers</h2>
        {report.bestSellers.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">Nothing sold yet.</p>
        ) : (
          <ol className="mt-4 space-y-2 text-sm">
            {report.bestSellers.map((product, index) => (
              <li
                key={product.productId}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-brand-charcoal/10 pt-2 first:border-t-0 first:pt-0"
              >
                <span>
                  <span className="mr-2 text-ink-muted tabular">
                    {index + 1}.
                  </span>
                  <span className="font-medium">{product.name}</span>
                </span>
                <span className="tabular text-ink-muted">
                  {product.quantity} sold · {rwf(product.revenue)}
                </span>
              </li>
            ))}
          </ol>
        )}
      </AdminPanel>
    </div>
  );
}
