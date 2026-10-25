import {
  buildBrandedEmailShell,
  escapeHtml,
  type BrandedEmailContent,
} from "@/lib/notifications/templates/email-shell";

export type StockLine = { name: string; quantity: number | null };

function list(title: string, lines: StockLine[], showQuantity: boolean): string {
  if (lines.length === 0) return "";
  const rows = lines
    .map(
      (line) =>
        `<li style="margin:4px 0;">${escapeHtml(line.name)}${
          showQuantity && line.quantity !== null
            ? ` — <strong>${line.quantity}</strong> left`
            : ""
        }</li>`,
    )
    .join("");
  return `<p style="margin:16px 0 4px;font-weight:700;">${escapeHtml(title)}</p><ul style="margin:0;padding-left:20px;">${rows}</ul>`;
}

/** Plain-English stock alert for staff: what is sold out and what is nearly gone. */
export function buildLowStockEmail(input: {
  soldOut: StockLine[];
  low: StockLine[];
  adminUrl: string;
  logoUrl: string;
  appUrl: string;
}): BrandedEmailContent {
  const { soldOut, low } = input;
  const parts = [
    soldOut.length > 0 ? `${soldOut.length} sold out` : "",
    low.length > 0 ? `${low.length} running low` : "",
  ].filter(Boolean);
  const subject = `Stock alert: ${parts.join(", ")}`;

  const textLines = [
    "Some drinks need restocking.",
    "",
    ...(soldOut.length > 0
      ? ["Sold out:", ...soldOut.map((line) => `  - ${line.name}`), ""]
      : []),
    ...(low.length > 0
      ? [
          "Running low:",
          ...low.map(
            (line) =>
              `  - ${line.name}${line.quantity !== null ? ` (${line.quantity} left)` : ""}`,
          ),
          "",
        ]
      : []),
    `Update stock: ${input.adminUrl}`,
  ];

  return buildBrandedEmailShell({
    textLines,
    subject,
    preheader: parts.join(" · "),
    eyebrow: "Stock alert",
    title: "Time to restock",
    intro: "These products are sold out or nearly gone.",
    bodyHtml:
      list("Sold out", soldOut, false) + list("Running low", low, true),
    ctaLabel: "Update stock",
    ctaUrl: input.adminUrl,
    logoUrl: input.logoUrl,
    appUrl: input.appUrl,
  });
}
