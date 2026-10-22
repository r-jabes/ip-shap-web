/**
 * Mirrored bulk-import validation (contract version 0.4.0).
 * Keep aligned with backend/contracts/bulk-import.ts — no cross-repo imports.
 */

import { z } from "zod";

export const BULK_IMPORT_HEADERS = [
  "slug",
  "name",
  "description",
  "price_rwf",
  "status",
  "availability",
  "category_slug",
  "brand_slug",
  "brand_name",
  "sku",
  "barcode",
  "stock_quantity",
  "is_provisional",
] as const;

const statusSchema = z.enum(["draft", "demo", "published", "archived"]);
const availabilitySchema = z.enum([
  "in_stock",
  "low_stock",
  "out_of_stock",
  "unknown",
]);

export const bulkImportRowSchema = z.object({
  slug: z
    .string()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(1).max(200),
  description: z.string().max(5000).default(""),
  price_rwf: z.number().int().nonnegative(),
  status: statusSchema,
  availability: availabilitySchema,
  category_slug: z.string().max(120).optional(),
  brand_slug: z.string().max(120).optional(),
  brand_name: z.string().max(200).optional(),
  sku: z.string().max(80).optional(),
  barcode: z.string().max(80).optional(),
  stock_quantity: z.number().int().nonnegative().nullable().optional(),
  is_provisional: z.boolean().default(false),
});

export type BulkImportRow = z.infer<typeof bulkImportRowSchema>;

export type BulkImportRowResult =
  | { rowNumber: number; ok: true; data: BulkImportRow; duplicateOf?: string }
  | {
      rowNumber: number;
      ok: false;
      errors: string[];
      raw: Record<string, string>;
    };

export type BulkImportReport = {
  dryRun: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  duplicateSlugs: string[];
  results: BulkImportRowResult[];
};

function parseBoolean(value: string | undefined): boolean {
  if (!value || value.trim() === "") return false;
  const v = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(v)) return true;
  if (["false", "0", "no", "n"].includes(v)) return false;
  throw new Error(`Invalid boolean: ${value}`);
}

function parseOptionalInt(
  value: string | undefined,
): number | null | undefined {
  if (value === undefined || value.trim() === "") return undefined;
  if (value.trim().toLowerCase() === "null") return null;
  const n = Number(value);
  if (!Number.isInteger(n)) throw new Error(`Expected integer, got: ${value}`);
  return n;
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      row.push(cell);
      cell = "";
      continue;
    }
    if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      if (ch === "\r") i += 1;
      continue;
    }
    if (ch === "\r") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += ch;
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

export function validateBulkImportCsv(
  csvText: string,
  options: { dryRun: boolean; existingSlugs?: Set<string> },
): BulkImportReport {
  const existing = options.existingSlugs ?? new Set<string>();
  const matrix = parseCsv(csvText);
  if (matrix.length === 0) {
    return {
      dryRun: options.dryRun,
      totalRows: 0,
      validRows: 0,
      invalidRows: 0,
      duplicateSlugs: [],
      results: [{ rowNumber: 0, ok: false, errors: ["CSV is empty"], raw: {} }],
    };
  }

  const header = matrix[0]!.map((h) => h.trim());
  const missing = BULK_IMPORT_HEADERS.filter((h) => !header.includes(h));
  if (missing.length > 0) {
    return {
      dryRun: options.dryRun,
      totalRows: 0,
      validRows: 0,
      invalidRows: 1,
      duplicateSlugs: [],
      results: [
        {
          rowNumber: 1,
          ok: false,
          errors: [`Missing required headers: ${missing.join(", ")}`],
          raw: Object.fromEntries(header.map((h) => [h, ""])),
        },
      ],
    };
  }

  const index = Object.fromEntries(header.map((h, i) => [h, i])) as Record<
    string,
    number
  >;
  const seen = new Set<string>();
  const duplicateSlugs: string[] = [];
  const results: BulkImportRowResult[] = [];

  for (let r = 1; r < matrix.length; r += 1) {
    const line = matrix[r]!;
    const raw: Record<string, string> = {};
    for (const key of BULK_IMPORT_HEADERS) {
      raw[key] = (line[index[key]!] ?? "").trim();
    }

    const errors: string[] = [];
    let data: BulkImportRow | undefined;
    try {
      const price = Number(raw.price_rwf);
      if (!Number.isInteger(price)) {
        throw new Error("price_rwf must be an integer");
      }
      const stock = parseOptionalInt(raw.stock_quantity);
      data = bulkImportRowSchema.parse({
        slug: raw.slug,
        name: raw.name,
        description: raw.description || "",
        price_rwf: price,
        status: raw.status || "draft",
        availability: raw.availability || "unknown",
        category_slug: raw.category_slug || undefined,
        brand_slug: raw.brand_slug || undefined,
        brand_name: raw.brand_name || undefined,
        sku: raw.sku || undefined,
        barcode: raw.barcode || undefined,
        stock_quantity: stock === undefined ? undefined : stock,
        is_provisional: parseBoolean(raw.is_provisional),
      });
    } catch (error) {
      errors.push(error instanceof Error ? error.message : "Invalid row");
    }

    if (!data) {
      results.push({ rowNumber: r + 1, ok: false, errors, raw });
      continue;
    }

    let duplicateOf: string | undefined;
    if (seen.has(data.slug) || existing.has(data.slug)) {
      duplicateOf = data.slug;
      if (!duplicateSlugs.includes(data.slug)) duplicateSlugs.push(data.slug);
    }
    seen.add(data.slug);
    results.push({ rowNumber: r + 1, ok: true, data, duplicateOf });
  }

  return {
    dryRun: options.dryRun,
    totalRows: results.length,
    validRows: results.filter((row) => row.ok).length,
    invalidRows: results.filter((row) => !row.ok).length,
    duplicateSlugs,
    results,
  };
}

export type BulkImportFieldGuide = {
  key: (typeof BULK_IMPORT_HEADERS)[number];
  label: string;
  required: boolean;
  allowed: string;
};

/** Operator-facing field meanings for the import UI (not written into the CSV). */
export const BULK_IMPORT_FIELD_GUIDE: readonly BulkImportFieldGuide[] = [
  {
    key: "slug",
    label: "Slug",
    required: true,
    allowed: "URL-safe id, lowercase letters/numbers/hyphens (e.g. house-red)",
  },
  {
    key: "name",
    label: "Name",
    required: true,
    allowed: "Display name shown in the shop",
  },
  {
    key: "description",
    label: "Description",
    required: false,
    allowed: "Product description text; wrap in quotes if it contains commas",
  },
  {
    key: "price_rwf",
    label: "Price (RWF)",
    required: true,
    allowed: "Whole francs only — integer, no decimals (e.g. 15000)",
  },
  {
    key: "status",
    label: "Status",
    required: false,
    allowed: "draft | demo | published | archived — blank defaults to draft",
  },
  {
    key: "availability",
    label: "Availability",
    required: false,
    allowed:
      "unknown | in_stock | low_stock | out_of_stock — blank defaults to unknown",
  },
  {
    key: "category_slug",
    label: "Category slug",
    required: false,
    allowed: "Must match an existing category slug",
  },
  {
    key: "brand_slug",
    label: "Brand slug",
    required: false,
    allowed: "URL-safe brand id (created/updated with brand_name on import)",
  },
  {
    key: "brand_name",
    label: "Brand name",
    required: false,
    allowed: "Brand display name",
  },
  {
    key: "sku",
    label: "SKU",
    required: false,
    allowed: "Internal stock-keeping code",
  },
  {
    key: "barcode",
    label: "Barcode",
    required: false,
    allowed: "Barcode / EAN if known",
  },
  {
    key: "stock_quantity",
    label: "Stock quantity",
    required: false,
    allowed: "Non-negative integer, or null when unknown",
  },
  {
    key: "is_provisional",
    label: "Provisional",
    required: false,
    allowed: "true | false — blank defaults to false",
  },
] as const;

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Downloadable sample template: header + example rows.
 * Omitted status in real files still defaults to draft — samples use draft explicitly.
 */
export function bulkImportTemplateCsv(): string {
  const header = BULK_IMPORT_HEADERS.join(",");
  const samples: string[][] = [
    [
      "house-red",
      "House Red",
      "Smooth everyday red — replace with your copy.",
      "15000",
      "draft",
      "in_stock",
      "wine",
      "ip-shap-house",
      "IP SHAP",
      "SKU-RED-001",
      "",
      "24",
      "false",
    ],
    [
      "house-white",
      "House White",
      "Crisp white for the table.",
      "14000",
      "draft",
      "unknown",
      "wine",
      "ip-shap-house",
      "IP SHAP",
      "",
      "",
      "null",
      "false",
    ],
  ];
  const lines = samples.map((row) => row.map(csvEscape).join(","));
  return `${header}\n${lines.join("\n")}\n`;
}
