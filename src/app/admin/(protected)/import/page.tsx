import { BulkImportPanel } from "@/components/admin/BulkImportPanel";

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Bulk import</h1>
        <p className="mt-2 max-w-2xl text-sm text-brand-dark-neutral">
          CSV dry-run with row-level validation, duplicate detection and an
          explicit report. Invalid rows are never silently skipped.
        </p>
      </div>
      <BulkImportPanel />
    </div>
  );
}
