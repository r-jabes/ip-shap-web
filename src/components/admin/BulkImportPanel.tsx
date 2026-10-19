"use client";

import { useState, useTransition } from "react";
import { previewBulkImportAction } from "@/app/admin/actions";
import type { BulkImportReport } from "@/lib/admin/bulk-import";
import { BULK_IMPORT_HEADERS } from "@/lib/admin/bulk-import";

export function BulkImportPanel() {
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <p className="text-sm text-brand-dark-neutral">
        Template headers (exact):{" "}
        <code className="text-xs">{BULK_IMPORT_HEADERS.join(",")}</code>
      </p>
      <form
        className="space-y-3"
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
        <label className="grid gap-1 text-sm">
          CSV content (dry-run preview — invalid rows are never skipped
          silently)
          <textarea
            name="csv"
            required
            rows={12}
            className="border border-brand-dark-neutral/30 px-3 py-2 font-mono text-xs"
            placeholder={`${BULK_IMPORT_HEADERS.join(",")}\n...`}
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white disabled:opacity-60"
        >
          {pending ? "Validating…" : "Dry-run validate"}
        </button>
      </form>
      {error ? (
        <p className="text-sm text-brand-burnt-orange" role="alert">
          {error}
        </p>
      ) : null}
      {report ? (
        <div className="space-y-3 border border-brand-dark-neutral/20 p-4 text-sm">
          <p>
            Dry-run: <strong>{String(report.dryRun)}</strong> · rows{" "}
            {report.totalRows} · valid {report.validRows} · invalid{" "}
            {report.invalidRows}
          </p>
          {report.duplicateSlugs.length > 0 ? (
            <p>Duplicate slugs: {report.duplicateSlugs.join(", ")}</p>
          ) : null}
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {report.results.map((row) => (
              <li
                key={row.rowNumber}
                className="border-t border-brand-dark-neutral/10 pt-2"
              >
                Row {row.rowNumber}:{" "}
                {row.ok ? (
                  <span>
                    OK {row.data.slug}
                    {row.duplicateOf ? " (duplicate)" : ""}
                  </span>
                ) : (
                  <span className="text-brand-burnt-orange">
                    {row.errors.join("; ")}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="text-brand-dark-neutral">
            Apply/commit import against Supabase is deferred until the catalogue
            is connected; dry-run validation is enforced now so operators can
            prepare 300+ row files safely.
          </p>
        </div>
      ) : null}
    </div>
  );
}
