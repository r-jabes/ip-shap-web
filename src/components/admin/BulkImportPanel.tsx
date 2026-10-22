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
        <div className="space-y-4">
          <Field id="bulk-csv" label="CSV content">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
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
              {pending ? "Working…" : "Validate"}
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
              Import
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
            {report.dryRun ? "Validation" : "Import"} · {report.totalRows} rows
            · {report.validRows} valid · {report.invalidRows} invalid
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
