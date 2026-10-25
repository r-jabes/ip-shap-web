import { redirect } from "next/navigation";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { BulkImportPanel } from "@/components/admin/BulkImportPanel";
import { Button } from "@/components/ui/Button";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminImportPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  // Say why instead of silently sending people back to the dashboard.
  if (!roleHasPermission(session.role, "import:run")) {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          title="Import products"
          description="Add or update many products at once from a spreadsheet (CSV file)."
        />
        <AdminPanel>
          <h2 className="font-display text-xl">You do not have access to this page</h2>
          <p className="mt-2 max-w-xl text-sm text-ink-muted">
            You are signed in as <strong>{session.role}</strong>. Importing a
            spreadsheet can change many products and prices at once, so it is
            limited to the <strong>owner</strong> and <strong>manager</strong>{" "}
            roles. Ask the owner to change your role on the Team page.
          </p>
          <div className="mt-4">
            <Button href="/admin/products" variant="secondary" size="sm">
              Back to products
            </Button>
          </div>
        </AdminPanel>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Import products"
        description="Add or update many products at once from a spreadsheet (CSV file). Download the template to see what to fill in."
      />
      <BulkImportPanel />
    </div>
  );
}
