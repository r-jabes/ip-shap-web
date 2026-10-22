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
import {
  BULK_IMPORT_FIELD_GUIDE,
  BULK_IMPORT_HEADERS,
  bulkImportTemplateCsv,
} from "@/lib/admin/bulk-import";

function downloadTemplate() {
  const csv = bulkImportTemplateCsv();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "ip-shap-product-import-template.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

export function BulkImportPanel() {
  const [csv, setCsv] = useState("");
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="min-w-0 space-y-6">
      <AdminPanel className="min-w-0 overflow-hidden">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={downloadTemplate}
          >
            Download template
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => {
              setCsv(bulkImportTemplateCsv().trimEnd());
              setReport(null);
              setApplied(null);
              setError(null);
            }}
          >
            Load sample into editor
          </Button>
        </div>

        <div className="mt-6 min-w-0">
          <h2 className="font-display text-lg">Field guide</h2>
          <p className="mt-1 text-sm text-ink-muted">
            Use these column names exactly. Blank status imports as draft.
          </p>
          <dl className="mt-4 divide-y divide-brand-charcoal/10 rounded-[var(--radius-frame)] border border-brand-charcoal/15">
            {BULK_IMPORT_FIELD_GUIDE.map((field) => (
              <div
                key={field.key}
                className="grid gap-1 px-3 py-3 sm:grid-cols-[minmax(0,9rem)_1fr] sm:gap-4"
              >
                <dt className="min-w-0">
                  <code className="break-all text-xs font-semibold text-brand-charcoal">
                    {field.key}
                  </code>
                  <span className="mt-0.5 block text-xs text-ink-muted">
                    {field.label}
                    {field.required ? " · required" : " · optional"}
                  </span>
                </dt>
                <dd className="min-w-0 text-sm break-words text-ink-muted">
                  {field.allowed}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 min-w-0 space-y-4">
          <Field id="bulk-csv" label="CSV content">
            <Textarea
              id="bulk-csv"
              name="csv"
              required
              rows={12}
              className="max-w-full min-w-0 overflow-x-auto font-mono text-xs break-all sm:break-normal"
              value={csv}
              onChange={(event) => setCsv(event.target.value)}
              placeholder={`${BULK_IMPORT_HEADERS.join(",")}\n…`}
              spellCheck={false}
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
          Imported {applied} row{applied === 1 ? "" : "s"}.
        </p>
      ) : null}

      {report ? (
        <AdminPanel className="min-w-0 space-y-3 overflow-hidden text-sm">
          <p>
            {report.dryRun ? "Validation" : "Import"} · {report.totalRows} rows
            · {report.validRows} valid · {report.invalidRows} invalid
          </p>
          {report.duplicateSlugs.length > 0 ? (
            <p className="break-words">
              Already in your catalogue or repeated in this file (these will be
              updated): {report.duplicateSlugs.join(", ")}
            </p>
          ) : null}
          <ul className="shop-filters-scroll max-h-80 space-y-2 overflow-y-auto">
            {report.results.map((row) => (
              <li
                key={row.rowNumber}
                className="break-words border-t border-brand-charcoal/10 pt-2"
              >
                Row {row.rowNumber}:{" "}
                {row.ok ? (
                  <span>
                    OK {row.data.slug}
                    {row.duplicateOf ? " (will update an existing product)" : ""}
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
