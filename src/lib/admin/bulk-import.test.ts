import { describe, expect, it } from "vitest";
import {
  BULK_IMPORT_FIELD_GUIDE,
  BULK_IMPORT_HEADERS,
  bulkImportTemplateCsv,
  validateBulkImportCsv,
} from "./bulk-import";

describe("validateBulkImportCsv", () => {
  it("surfaces invalid rows instead of skipping them", () => {
    const csv = `${BULK_IMPORT_HEADERS.join(",")}\nbad slug,Name,Desc,x,draft,unknown,,,,,,,false`;
    const report = validateBulkImportCsv(csv, { dryRun: true });
    expect(report.invalidRows).toBe(1);
    expect(report.results[0]?.ok).toBe(false);
  });

  it("creates web address names from the name when left blank", () => {
    const csv = `${BULK_IMPORT_HEADERS.join(",")}\n,House Rose,Desc,12000,,unknown,,,Johnnie Walker,,,,false\n,House Rose,Desc,12000,,unknown,,,,,,,false`;
    const report = validateBulkImportCsv(csv, { dryRun: true });
    expect(report.invalidRows).toBe(0);
    const [first, second] = report.results;
    if (first?.ok && second?.ok) {
      expect(first.data.slug).toBe("house-rose");
      expect(first.data.brand_slug).toBe("johnnie-walker");
      expect(second.data.slug).toBe("house-rose-2");
    } else {
      throw new Error("rows should be valid");
    }
  });

  it("defaults blank status to draft", () => {
    const csv = `${BULK_IMPORT_HEADERS.join(",")}\nhouse-rose,House Rose,Desc,12000,,unknown,wine,ip-shap-house,IP SHAP,,,12,false`;
    const report = validateBulkImportCsv(csv, { dryRun: true });
    expect(report.invalidRows).toBe(0);
    expect(report.results[0]?.ok).toBe(true);
    if (report.results[0]?.ok) {
      expect(report.results[0].data.status).toBe("draft");
    }
  });
});

describe("bulkImportTemplateCsv", () => {
  it("includes headers, draft samples, and validates cleanly", () => {
    const csv = bulkImportTemplateCsv();
    expect(csv.startsWith(`${BULK_IMPORT_HEADERS.join(",")}\n`)).toBe(true);
    expect(csv).toContain(",draft,");
    expect(BULK_IMPORT_FIELD_GUIDE).toHaveLength(BULK_IMPORT_HEADERS.length);

    const report = validateBulkImportCsv(csv, { dryRun: true });
    expect(report.invalidRows).toBe(0);
    expect(report.validRows).toBe(2);
    for (const row of report.results) {
      if (row.ok) expect(row.data.status).toBe("draft");
    }
  });
});
