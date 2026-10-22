import {
  AdminPageHeader,
  AdminPanel,
  AdminStat,
} from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import {
  adminDashboardCounts,
  adminListAdjustments,
  adminListAudits,
  adminListLowStockProducts,
} from "@/lib/admin/store";

export default function AdminDashboardPage() {
  const counts = adminDashboardCounts();
  const adjustments = adminListAdjustments(5);
  const audits = adminListAudits(8);
  const lowStock = adminListLowStockProducts().slice(0, 8);

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Dashboard"
        description="Overview of catalogue and stock."
        actions={
          <>
            <Button href="/admin/orders" variant="secondary" size="sm">
              Orders
            </Button>
            <Button href="/admin/products/new" variant="primary" size="sm">
              New product
            </Button>
            <Button href="/admin/stock" variant="ghost" size="sm">
              Adjust stock
            </Button>
            <Button href="/admin/import" variant="ghost" size="sm">
              Bulk import
            </Button>
          </>
        }
      />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["Total products", counts.totalProducts],
            ["Published", counts.published],
            ["Draft / demo", counts.draft],
            ["Archived", counts.archived],
            ["Unknown stock", counts.unknownStock],
            ["Low stock", counts.lowStock],
            ["Out of stock", counts.outOfStock],
          ] as const
        ).map(([label, value]) => (
          <AdminStat key={label} label={label} value={value} />
        ))}
      </ul>

      <AdminPanel>
        <h2 className="font-display text-xl">Low stock</h2>
        {lowStock.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">None right now.</p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {lowStock.map((product) => (
              <li
                key={product.id}
                className="flex flex-wrap items-baseline justify-between gap-2 border-t border-brand-charcoal/10 pt-2 first:border-t-0 first:pt-0"
              >
                <span className="font-medium">{product.name}</span>
                <span className="tabular text-ink-muted">
                  {product.availability}
                  {typeof product.stockQuantity === "number"
                    ? ` · qty ${product.stockQuantity}`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminPanel>
          <h2 className="font-display text-xl">Recent stock adjustments</h2>
          {adjustments.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">None yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {adjustments.map((row) => (
                <li
                  key={row.id}
                  className="border-t border-brand-charcoal/10 pt-3 first:border-t-0 first:pt-0"
                >
                  <span className="text-ink-muted tabular">{row.createdAt}</span>
                  <span className="mx-1.5 text-ink-muted">·</span>
                  {row.actorEmail}
                  <span className="mx-1.5 text-ink-muted">·</span>
                  <span className="tabular">
                    {row.previousQuantity} → {row.newQuantity}
                  </span>
                  <span className="mx-1.5 text-ink-muted">·</span>
                  {row.reason}
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>

        <AdminPanel>
          <h2 className="font-display text-xl">Audit trail</h2>
          {audits.length === 0 ? (
            <p className="mt-3 text-sm text-ink-muted">No events yet.</p>
          ) : (
            <ul className="mt-4 space-y-3 text-sm">
              {audits.map((event) => (
                <li
                  key={event.id}
                  className="border-t border-brand-charcoal/10 pt-3 first:border-t-0 first:pt-0"
                >
                  <span className="text-ink-muted tabular">
                    {event.createdAt}
                  </span>
                  <span className="mx-1.5 text-ink-muted">·</span>
                  {event.actorEmail ?? "system"}
                  <span className="mx-1.5 text-ink-muted">·</span>
                  {event.action}
                  <span className="mx-1.5 text-ink-muted">·</span>
                  {event.entityType}
                  {event.entityId ? `:${event.entityId.slice(0, 8)}` : ""}
                </li>
              ))}
            </ul>
          )}
        </AdminPanel>
      </div>
    </div>
  );
}
