import type { Metadata } from "next";
import { Archivo, DM_Sans } from "next/font/google";
import { AuthLinkRedirect } from "@/components/admin/AuthLinkRedirect";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";
import { getPublicEnv } from "@/lib/env";
import { defaultRobots } from "@/lib/seo";
import "./globals.css";

export const viewport = {
  themeColor: "#20201e",
};

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/** Heavy geometric display face with a width axis; echoes the logo wordmark. */
const displayFont = Archivo({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
  axes: ["wdth"],
});

const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${SHORT_BRAND} | ${LEGAL_NAME}`,
    template: `%s | ${SHORT_BRAND}`,
  },
  description:
    "Wholesale wines, spirits, beer and soft drinks from THE IP SHAP BUSINESS LTD in Rwanda. Browse the range and place your order on this site.",
  openGraph: {
    title: `${SHORT_BRAND} | ${LEGAL_NAME}`,
    description:
      "Wholesale wines, spirits, beer and soft drinks from THE IP SHAP BUSINESS LTD in Rwanda. Browse the range and place your order on this site.",
    url: appUrl,
    siteName: SHORT_BRAND,
    locale: "en_RW",
    type: "website",
    images: [{ url: "/home/hero.webp", alt: LEGAL_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SHORT_BRAND} | ${LEGAL_NAME}`,
    description:
      "Wholesale wines, spirits, beer and soft drinks from THE IP SHAP BUSINESS LTD in Rwanda. Browse the range and place your order on this site.",
    images: [{ url: "/home/hero.webp", alt: LEGAL_NAME }],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/branding/app-icon.png", type: "image/png" },
    ],
    apple: [{ url: "/branding/app-icon.png", type: "image/png" }],
  },
  robots: defaultRobots(),
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? {
        verification: {
          google: process.env.GOOGLE_SITE_VERIFICATION,
        },
      }
    : {}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The age-gate boot script sets an attribute on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bodyFont.variable} ${displayFont.variable} font-sans antialiased`}
      >
        <AuthLinkRedirect />
        {children}
      </body>
    </html>
  );
}
