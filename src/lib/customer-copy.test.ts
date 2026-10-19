import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Customer-facing UI must never admit it is a prototype ("demo", "provisional", "unverified",
 * "placeholder", "dummy", "prototype"). The only allowed signal is the dev-only `PreviewIndicator`.
 * Code identifiers (e.g. `formatDemoPrice`), imports, comments and HTML `placeholder` attributes
 * are ignored; this checks the words people can read.
 */

const ROOT = join(process.cwd(), "src");
const SCANNED = [
  "app/(storefront)",
  "components/layout",
  "components/cart",
  "components/catalogue",
  "components/product",
  "components/content",
  "components/checkout",
  "components/home",
  "app/not-found.tsx",
  "app/error.tsx",
  "app/layout.tsx",
];
const SKIPPED_FILES = [/PreviewIndicator\.tsx$/, /\.test\.tsx?$/];
const BANNED =
  /\b(demo|provisional|unverified|placeholders?|dummy|prototype|not configured|SKU)\b(?![:=])/i;

function walk(dir: string): string[] {
  if (/\.tsx?$/.test(dir)) return [dir];
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return walk(full);
    return /\.tsx?$/.test(name) ? [full] : [];
  });
}

function readable(source: string): string {
  return source
    .replace(/import[\s\S]*?from\s+["'][^"']+["'];?/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/.*$/gm, "$1")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "");
}

describe("customer-facing copy", () => {
  const files = SCANNED.flatMap((dir) => walk(join(ROOT, dir))).filter(
    (file) => !SKIPPED_FILES.some((pattern) => pattern.test(file)),
  );

  it("scans files", () => {
    expect(files.length).toBeGreaterThan(10);
  });

  it("contains no prototype wording", () => {
    const offenders: string[] = [];
    for (const file of files) {
      readable(readFileSync(file, "utf8"))
        .split("\n")
        .forEach((line, index) => {
          if (BANNED.test(line)) {
            offenders.push(
              `${relative(ROOT, file)}:${index + 1}  ${line.trim()}`,
            );
          }
        });
    }
    expect(offenders).toEqual([]);
  });
});
