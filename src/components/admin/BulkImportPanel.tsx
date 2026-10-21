"use client";

import { useState, useTransition } from "react";
import {
  applyBulkImportAction,
  previewBulkImportAction,
} from "@/app/admin/actions";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import type { BulkImportReport } from "@/lib/admin/bulk-import";
import { BULK_IMPORT_HEADERS } from "@/lib/admin/bulk-import";

export function BulkImportPanel() {
  const [csv, setCsv] = useState("");
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<number | null>(null);
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
        <div className="mt-4 space-y-4">
          <Field
            id="bulk-csv"
            label="CSV content"
            hint="Dry-run first. Apply runs in one database transaction when Supabase is configured."
          >
            <Textarea
              id="bulk-csv"
              name="csv"
              required
              rows={12}
              className="font-mono text-xs"
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              placeholder={`${BULK_IMPORT_HEADERS.join(",")}\n...`}
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={pending}
              disabled={pending || !csv.trim()}
              onClick={() => {
                const formData = new FormData();
                formData.set("csv", csv);
                setError(null);
                setApplied(null);
                startTransition(async () => {
                  try {
                    const result = await previewBulkImportAction(formData);
                    setReport(
                      JSON.parse(result.reportJson) as BulkImportReport,
                    );
                  } catch (err) {
                    setError(
                      err instanceof Error ? err.message : "Import failed",
                    );
                  }
                });
              }}
            >
              {pending ? "Working…" : "Dry-run validate"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              loading={pending}
              disabled={
                pending ||
                !csv.trim() ||
                !report ||
                report.invalidRows > 0 ||
                report.validRows === 0
              }
              onClick={() => {
                const formData = new FormData();
                formData.set("csv", csv);
                setError(null);
                startTransition(async () => {
                  const result = await applyBulkImportAction(formData);
                  if (result.reportJson) {
                    setReport(
                      JSON.parse(result.reportJson) as BulkImportReport,
                    );
                  }
                  if (result.error) setError(result.error);
                  else if (typeof result.applied === "number") {
                    setApplied(result.applied);
                  }
                });
              }}
            >
              Apply import
            </Button>
          </div>
        </div>
      </AdminPanel>

      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {applied !== null ? (
        <p className="text-sm text-brand-charcoal" role="status">
          Applied {applied} row{applied === 1 ? "" : "s"}.
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
            <p>Duplicate slugs in file: {report.duplicateSlugs.join(", ")}</p>
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
                    {row.duplicateOf ? " (duplicate in file)" : ""}
                  </span>
                ) : (
                  <span className="text-red-800">{row.errors.join("; ")}</span>
                )}
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}
    </div>
  );
}
