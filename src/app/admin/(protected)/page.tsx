import {
  AdminPageHeader,
  AdminPanel,
  AdminStat,
} from "@/components/admin/admin-ui";
import {
  formatAvailabilityLabel,
  formatStockSummary,
} from "@/components/admin/AdminStatusBadge";
import { Button } from "@/components/ui/Button";
import { loadAdminDashboard } from "@/lib/admin/dashboard";
import { describeAuditAction, formatAdminDateTime } from "@/lib/admin/format";

export default async function AdminDashboardPage() {
  const { counts, adjustments, audits, lowStock } = await loadAdminDashboard();

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Dashboard"
        description="A quick look at your catalogue and stock."
        actions={
          <>
            <Button href="/admin/products?add=1" variant="primary" size="sm">
              Add product
            </Button>
            <Button href="/admin/orders" variant="ghost" size="sm">
              Orders
            </Button>
            <Button href="/admin/stock?add=1" variant="ghost" size="sm">
              Update stock
            </Button>
            <Button href="/admin/import" variant="ghost" size="sm">
              Import
            </Button>
          </>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["Products", counts.totalProducts],
            ["Published", counts.published],
            ["Drafts", counts.draft],
            ["Archived", counts.archived],
            ["Stock not tracked", counts.unknownStock],
            ["Running low", counts.lowStock],
            ["Sold out", counts.outOfStock],
          ] as const
        ).map(([label, value]) => (
          <AdminStat key={label} label={label} value={value} />
        ))}
      </ul>

      <AdminPanel>
        <h2 className="font-display text-xl">Running low</h2>
        {lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">
            No products are running low right now.
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {lowStock.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-brand-charcoal/10 pt-2 first:border-t-0 first:pt-0"
              >
                <span className="font-medium">{product.name}</span>
                <span className="tabular text-ink-muted">
                  {formatAvailabilityLabel(product.availability)}
                  {typeof product.stockQuantity === "number"
                    ? ` · ${formatStockSummary(product.availability, product.stockQuantity)} left`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <h2 className="font-display text-xl">Recent stock changes</h2>
          {adjustments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">None yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {adjustments.map((row) => (
                <li
                  key={row.id}
                  className="border-t border-brand-charcoal/10 pt-3 first:border-t-0 first:pt-0"
                >
                  <p className="font-medium">
                    {row.productName}
                    <span className="ml-2 font-normal text-ink-muted tabular">
                      {row.previousQuantity ?? "—"} → {row.newQuantity ?? "—"}
                    </span>
                  </p>
                  <p className="text-ink-muted">
                    {row.reason} · {row.actorEmail} ·{" "}
                    {formatAdminDateTime(row.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel>
          <h2 className="font-display text-xl">Recent activity</h2>
          {audits.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">Nothing yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {audits.map((event) => (
                <li
                  key={event.id}
                  className="border-t border-brand-charcoal/10 pt-3 first:border-t-0 first:pt-0"
                >
                  <p className="font-medium">
                    {describeAuditAction(event.action)}
                  </p>
                  <p className="text-ink-muted">
                    {event.actorEmail ?? "System"} ·{" "}
                    {formatAdminDateTime(event.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
