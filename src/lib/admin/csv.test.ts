import { describe, expect, it } from "vitest";
import { csvCell, toCsv } from "@/lib/admin/csv";

describe("csvCell", () => {
  it("quotes cells containing commas, quotes or line breaks", () => {
    expect(csvCell("a,b")).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });

  it("neutralises spreadsheet formulas typed by customers", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe(
      '"\'=HYPERLINK(""http://evil"")"',
    );
    expect(csvCell("+250788123456")).toBe("'+250788123456");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell("-1+1")).toBe("'-1+1");
  });

  it("leaves real numbers alone, including negatives", () => {
    expect(csvCell(-5)).toBe("-5");
    expect(csvCell(15000)).toBe("15000");
  });

  it("writes empty cells for missing values", () => {
    expect(csvCell(null)).toBe("");
    expect(csvCell(undefined)).toBe("");
  });
});

describe("toCsv", () => {
  it("starts with a byte-order mark and uses Windows line endings", () => {
    const csv = toCsv(["A", "B"], [["x", 1]]);
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toBe("\uFEFFA,B\r\nx,1\r\n");
  });
});
