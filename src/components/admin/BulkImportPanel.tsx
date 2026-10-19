"use client";

import { useState, useTransition } from "react";
import { previewBulkImportAction } from "@/app/admin/actions";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import type { BulkImportReport } from "@/lib/admin/bulk-import";
import { BULK_IMPORT_HEADERS } from "@/lib/admin/bulk-import";

export function BulkImportPanel() {
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <AdminPanel>
        <p className="text-sm text-ink-muted">
          Template headers (exact):{" "}
          <code className="rounded-md bg-paper-2 px-1.5 py-0.5 text-xs text-brand-charcoal">
            {BULK_IMPORT_HEADERS.join(",")}
          </code>
        </p>
        <form
          className="mt-4 space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            setError(null);
            startTransition(async () => {
              try {
                const result = await previewBulkImportAction(formData);
                setReport(JSON.parse(result.reportJson) as BulkImportReport);
              } catch (err) {
                setError(err instanceof Error ? err.message : "Import failed");
              }
            });
          }}
        >
          <Field
            id="bulk-csv"
            label="CSV content"
            hint="Dry-run preview — invalid rows are never skipped silently."
          >
            <Textarea
              id="bulk-csv"
              name="csv"
              required
              rows={12}
              className="font-mono text-xs"
              placeholder={`${BULK_IMPORT_HEADERS.join(",")}\n...`}
            />
          </Field>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={pending}
            disabled={pending}
          >
            {pending ? "Validating…" : "Dry-run validate"}
          </Button>
        </form>
      </AdminPanel>

      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {report ? (
        <AdminPanel className="space-y-3 text-sm">
          <p>
            Dry-run: <strong>{String(report.dryRun)}</strong> · rows{" "}
            {report.totalRows} · valid {report.validRows} · invalid{" "}
            {report.invalidRows}
          </p>
          {report.duplicateSlugs.length > 0 ? (
            <p>Duplicate slugs: {report.duplicateSlugs.join(", ")}</p>
          ) : null}
          <ul className="shop-filters-scroll max-h-80 space-y-2 overflow-y-auto">
            {report.results.map((row) => (
              <li
                key={row.rowNumber}
                className="border-t border-brand-charcoal/10 pt-2"
              >
                Row {row.rowNumber}:{" "}
                {row.ok ? (
                  <span>
                    OK {row.data.slug}
                    {row.duplicateOf ? " (duplicate)" : ""}
                  </span>
                ) : (
                  <span className="text-red-800">{row.errors.join("; ")}</span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-ink-muted">
            Apply/commit import against Supabase is deferred until the catalogue
            is connected; dry-run validation is enforced now so operators can
            prepare 300+ row files safely.
          </p>
        </AdminPanel>
      ) : null}
    </div>
  );
}
