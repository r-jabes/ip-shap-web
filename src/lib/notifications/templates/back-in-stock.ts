import {
  buildBrandedEmailShell,
  type BrandedEmailContent,
} from "@/lib/notifications/templates/email-shell";

/** Customer email: the drink they asked about is available again. */
export function buildBackInStockEmail(input: {
  productName: string;
  productUrl: string;
  logoUrl: string;
  appUrl: string;
}): BrandedEmailContent {
  const subject = `${input.productName} is back in stock`;
  return buildBrandedEmailShell({
    subject,
    preheader: "You asked us to tell you. It is ready to order now.",
    eyebrow: "Back in stock",
    title: `${input.productName} is back`,
    intro:
      "You asked us to let you know. It is available again, but stock can go quickly, so order soon.",
    ctaLabel: "View the drink",
    ctaUrl: input.productUrl,
    footerNote:
      "You are getting this one-time email because you asked to be told when this drink returned.",
    logoUrl: input.logoUrl,
    appUrl: input.appUrl,
    textLines: [
      `${input.productName} is back in stock.`,
      "",
      "You asked us to let you know. Stock can go quickly, so order soon.",
      "",
      `View it here: ${input.productUrl}`,
      "",
      "You are getting this one-time email because you asked to be told when this drink returned.",
    ],
  });
}
