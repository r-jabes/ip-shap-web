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

  it("only needs the name and price columns", () => {
    const report = validateBulkImportCsv("name,price_rwf\nHouse Red,15000\nHouse White,14000", {
      dryRun: true,
    });
    expect(report.invalidRows).toBe(0);
    expect(report.validRows).toBe(2);
    const first = report.results[0];
    if (first?.ok) {
      expect(first.data.slug).toBe("house-red");
      expect(first.data.status).toBe("draft");
      expect(first.data.brand_name).toBeUndefined();
    }
  });

  it("names the required columns that are missing, in plain English", () => {
    const report = validateBulkImportCsv("title,cost\nHouse Red,15000", {
      dryRun: true,
    });
    const first = report.results[0];
    expect(first?.ok).toBe(false);
    if (first && !first.ok) {
      expect(first.errors[0]).toContain("name, price_rwf");
    }
  });

  it("ignores a hidden byte-order mark and header capitalisation", () => {
    const report = validateBulkImportCsv("\uFEFFName,Price_RWF\nHouse Red,15000", {
      dryRun: true,
    });
    expect(report.validRows).toBe(1);
  });

  it("explains a bad row without raw validation output", () => {
    const report = validateBulkImportCsv("name,price_rwf,status\nHouse Red,15.5,live\n,100,draft\nGin,,draft", {
      dryRun: true,
    });
    expect(report.invalidRows).toBe(3);
    for (const row of report.results) {
      if (!row.ok) {
        for (const message of row.errors) {
          expect(message).not.toMatch(/[{[]\s*"/);
        }
      }
    }
    const [bad, noName, noPrice] = report.results;
    if (bad && !bad.ok) expect(bad.errors[0]).toContain("whole number");
    if (noName && !noName.ok) expect(noName.errors).toEqual(["Name is required."]);
    if (noPrice && !noPrice.ok) expect(noPrice.errors).toEqual(["Price (RWF) is required."]);
  });

  it("explains an invalid status", () => {
    const report = validateBulkImportCsv("name,price_rwf,status\nHouse Red,15000,live", {
      dryRun: true,
    });
    const row = report.results[0];
    expect(row?.ok).toBe(false);
    if (row && !row.ok) expect(row.errors[0]).toContain("Status");
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
