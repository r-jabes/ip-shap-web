import { redirect } from "next/navigation";
import {
  AdminCard,
  AdminPageHeader,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { listAuditsDurable } from "@/lib/admin/audit-durable";
import { describeAuditAction, formatAdminDateTime } from "@/lib/admin/format";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

/** The full trail of who changed what — the dashboard only shows the latest few. */
export default async function AdminActivityPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleHasPermission(session.role, "audit:read")) redirect("/admin");

  const params = await searchParams;
  const events = await listAuditsDurable(500);
  const pageResult = paginateItems(events, parseAdminPage(params.page));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Activity"
        description="Every change made in the admin area: who did it and when. The latest 500 changes are kept in view."
      />

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">Nothing has been changed yet.</p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((event) => (
              <AdminCard key={event.id}>
                <p className="font-semibold">
                  {describeAuditAction(event.action)}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {event.actorEmail ?? "System"} ·{" "}
                  {formatAdminDateTime(event.createdAt)}
                </p>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh>When</AdminTh>
                <AdminTh>Who</AdminTh>
                <AdminTh>What</AdminTh>
                <AdminTh>Item</AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((event) => (
                <tr key={event.id}>
                  <AdminTd className="whitespace-nowrap tabular">
                    {formatAdminDateTime(event.createdAt)}
                  </AdminTd>
                  <AdminTd>{event.actorEmail ?? "System"}</AdminTd>
                  <AdminTd className="font-medium">
                    {describeAuditAction(event.action)}
                  </AdminTd>
                  <AdminTd className="text-ink-muted">
                    {event.entityType.replace(/[._]/g, " ")}
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <AdminPagination
            pathname="/admin/activity"
            searchParams={{}}
            result={pageResult}
            label="changes"
          />
        </>
      )}
    </div>
  );
}
