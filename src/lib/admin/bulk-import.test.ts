import { describe, expect, it } from "vitest";
import { BULK_IMPORT_HEADERS, validateBulkImportCsv } from "./bulk-import";

describe("validateBulkImportCsv", () => {
  it("surfaces invalid rows instead of skipping them", () => {
    const csv = `${BULK_IMPORT_HEADERS.join(",")}\nbad slug,Name,Desc,x,draft,unknown,,,,,,,false`;
    const report = validateBulkImportCsv(csv, { dryRun: true });
    expect(report.invalidRows).toBe(1);
    expect(report.results[0]?.ok).toBe(false);
  });
});
