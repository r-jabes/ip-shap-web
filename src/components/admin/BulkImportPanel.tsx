"use client";

import { useState, useTransition } from "react";
import {
  applyBulkImportAction,
  previewBulkImportAction,
} from "@/app/admin/actions";
import { useAdminToast } from "@/components/admin/AdminToast";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Textarea } from "@/components/ui/Field";
import { FilePicker } from "@/components/ui/FilePicker";
import type { BulkImportReport } from "@/lib/admin/bulk-import";
import {
  BULK_IMPORT_FIELD_GUIDE,
  BULK_IMPORT_HEADERS,
  bulkImportTemplateCsv,
} from "@/lib/admin/bulk-import";

/** Next.js server actions accept about 1 MB by default, so stay safely under it. */
const MAX_CSV_BYTES = 1_000_000;

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

/** One short sentence for the toast: what is wrong and where to look first. */
function problemSummary(report: BulkImportReport): string {
  const bad = report.results.filter((row) => !row.ok);
  const first = bad[0];
  if (!first || first.ok) return "This file could not be checked.";
  // A missing-columns or empty-file problem is about the whole file, not one product.
  if (report.totalRows === 0) return first.errors[0] ?? "This file could not be checked.";
  const count = bad.length;
  return `${count} row${count === 1 ? " needs" : "s need"} fixing. Row ${first.rowNumber}: ${first.errors[0]}`;
}

export function BulkImportPanel() {
  const toast = useAdminToast();
  const [csv, setCsv] = useState("");
  const [report, setReport] = useState<BulkImportReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function fail(message: string) {
    setError(message);
    toast.error(message);
  }

  function validate(text: string) {
    const formData = new FormData();
    formData.set("csv", text);
    setError(null);
    setApplied(null);
    startTransition(async () => {
      try {
        const result = await previewBulkImportAction(formData);
        const next = JSON.parse(result.reportJson) as BulkImportReport;
        setReport(next);
        if (next.invalidRows > 0) {
          fail(problemSummary(next));
        } else if (next.validRows > 0) {
          toast.success(
            `All ${next.validRows} row${next.validRows === 1 ? "" : "s"} look good. Press Import to add ${next.validRows === 1 ? "it" : "them"}.`,
          );
        } else {
          fail("No products were found in this file.");
        }
      } catch (err) {
        fail(
          err instanceof Error
            ? err.message
            : "Could not check this file. Please try again.",
        );
      }
    });
  }

  async function onFilePicked(file: File | null) {
    if (!file) return;
    if (file.size > MAX_CSV_BYTES) {
      fail("That file is too large. Keep each import under 1 MB (about 5,000 products).");
      return;
    }
    if (!/\.(csv|txt)$/i.test(file.name) && !file.type.includes("csv")) {
      fail("Please choose a CSV file. In Excel or Google Sheets use Save as → CSV.");
      return;
    }
    try {
      const text = await file.text();
      setCsv(text);
      setReport(null);
      validate(text);
    } catch {
      fail("We could not read that file. Please try another one.");
    }
  }

  function apply() {
    const formData = new FormData();
    formData.set("csv", csv);
    setError(null);
    startTransition(async () => {
      try {
        const result = await applyBulkImportAction(formData);
        if (result.reportJson) {
          setReport(JSON.parse(result.reportJson) as BulkImportReport);
        }
        if (result.error) {
          fail(result.error);
        } else if (typeof result.applied === "number") {
          setApplied(result.applied);
          toast.success(
            `Imported ${result.applied} product${result.applied === 1 ? "" : "s"}.`,
          );
        }
      } catch (err) {
        fail(
          err instanceof Error
            ? err.message
            : "The import did not finish. Please try again.",
        );
      }
    });
  }

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
            Only <code className="text-xs font-semibold">name</code> and{" "}
            <code className="text-xs font-semibold">price_rwf</code> are
            needed. Any other column can be left out. Use the column names
            exactly as shown. Blank status imports as draft.
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
          <Field
            id="bulk-file"
            label="Upload a CSV file"
            hint="Save your spreadsheet as CSV, then choose it here (up to 1 MB). We check it straight away and nothing is added until you press Import."
          >
            <FilePicker
              id="bulk-file"
              accept=".csv,text/csv"
              buttonLabel="Choose CSV file"
              emptyText="No file chosen"
              describedBy="bulk-file-hint"
              resetAfterPick
              onPick={onFilePicked}
            />
          </Field>

          <Field
            id="bulk-csv"
            label="Or paste or edit the CSV here"
          >
            <Textarea
              id="bulk-csv"
              name="csv"
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
              onClick={() => validate(csv)}
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
              onClick={apply}
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
          <ul className="site-scroll max-h-80 space-y-2 overflow-y-auto">
            {report.results.map((row) => (
              <li
                key={row.rowNumber}
                className="break-words border-t border-brand-charcoal/10 pt-2"
              >
                {row.rowNumber > 0 ? `Row ${row.rowNumber}: ` : "File: "}
                {row.ok ? (
                  <span>
                    OK {row.data.slug}
                    {row.duplicateOf ? " (will update an existing product)" : ""}
                  </span>
                ) : (
                  <span className="text-red-800">{row.errors.join(" ")}</span>
                )}
              </li>
            ))}
          </ul>
        </AdminPanel>
      ) : null}
    </div>
  );
}
