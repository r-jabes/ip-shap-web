import { redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { BulkImportPanel } from "@/components/admin/BulkImportPanel";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminImportPage() {
  const session = await getAdminSession();
  if (!session || !roleHasPermission(session.role, "import:run")) {
    redirect("/admin");
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
