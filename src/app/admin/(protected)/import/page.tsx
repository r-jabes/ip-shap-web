import { AdminPageHeader } from "@/components/admin/admin-ui";
import { BulkImportPanel } from "@/components/admin/BulkImportPanel";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bulk import"
        description="CSV dry-run with row-level validation, duplicate detection and an explicit report. Invalid rows are never silently skipped."
      />
      <BulkImportPanel />
    </div>
  );
}
