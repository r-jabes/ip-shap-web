import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";
import { getPublicEnv } from "@/lib/env";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${SHORT_BRAND} | ${LEGAL_NAME}`,
    template: `%s | ${SHORT_BRAND}`,
  },
  description:
    "Premium drinks storefront prototype for THE IP SHAP BUSINESS LTD — Rwanda. Demo catalogue only; details await owner confirmation.",
  openGraph: {
    title: `${SHORT_BRAND} | ${LEGAL_NAME}`,
    description:
      "Client-facing storefront prototype. Demo products and prices are illustrative.",
    url: appUrl,
    siteName: SHORT_BRAND,
    locale: "en_RW",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
