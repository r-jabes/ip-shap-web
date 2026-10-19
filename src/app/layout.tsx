import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
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

export const metadata: Metadata = {
  title: {
    default: "IP SHAP | THE IP SHAP BUSINESS LTD",
    template: "%s | IP SHAP",
  },
  description:
    "Online drinks storefront for THE IP SHAP BUSINESS LTD. Foundation build — catalogue and commerce features arrive in later phases.",
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
