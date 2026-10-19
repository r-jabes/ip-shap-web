import Link from "next/link";
import {
  adminDashboardCounts,
  adminListAdjustments,
  adminListAudits,
} from "@/lib/admin/store";

export default function AdminDashboardPage() {
  const counts = adminDashboardCounts();
  const adjustments = adminListAdjustments(5);
  const audits = adminListAudits(8);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-3xl">Operations dashboard</h1>
        <p className="mt-2 text-sm text-brand-dark-neutral">
          Counts are backed by the live admin store (demo in-memory / future
          Supabase). No invented analytics.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["Total products", counts.totalProducts],
            ["Published", counts.published],
            ["Draft / demo", counts.draft],
            ["Archived", counts.archived],
            ["Unknown stock", counts.unknownStock],
            ["Out of stock", counts.outOfStock],
          ] as const
        ).map(([label, value]) => (
          <li
            key={label}
            className="border border-brand-dark-neutral/20 px-4 py-5"
          >
            <p className="text-xs tracking-[0.12em] text-brand-dark-neutral uppercase">
              {label}
            </p>
            <p className="mt-2 font-display text-3xl">{value}</p>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/admin/orders"
          className="bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white"
        >
          Orders
        </Link>
        <Link
          href="/admin/products/new"
          className="border border-brand-charcoal px-4 py-2 text-sm"
        >
          New product
        </Link>
        <Link
          href="/admin/stock"
          className="border border-brand-charcoal px-4 py-2 text-sm"
        >
          Adjust stock
        </Link>
        <Link
          href="/admin/import"
          className="border border-brand-charcoal px-4 py-2 text-sm"
        >
          Bulk import
        </Link>
      </div>

      <section>
        <h2 className="font-display text-2xl">Recent stock adjustments</h2>
        {adjustments.length === 0 ? (
          <p className="mt-2 text-sm text-brand-dark-neutral">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-brand-dark-neutral/15 text-sm">
            {adjustments.map((row) => (
              <li key={row.id} className="py-2">
                {row.createdAt} · {row.actorEmail} · {row.previousQuantity} →{" "}
                {row.newQuantity} · {row.reason}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-2xl">Audit trail</h2>
        {audits.length === 0 ? (
          <p className="mt-2 text-sm text-brand-dark-neutral">No events yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-brand-dark-neutral/15 text-sm">
            {audits.map((event) => (
              <li key={event.id} className="py-2">
                {event.createdAt} · {event.actorEmail ?? "system"} ·{" "}
                {event.action} · {event.entityType}
                {event.entityId ? `:${event.entityId.slice(0, 8)}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
