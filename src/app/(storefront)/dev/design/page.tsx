import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DesignKit } from "@/components/dev/DesignKit";

export const metadata: Metadata = {
  title: "Design kit",
  robots: { index: false, follow: false },
};

/** Internal reference page for the component kit. Not available in production builds. */
export default function DesignKitPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <>
      <div className="border-b border-line px-6 py-8 sm:px-10">
        <h1
          className="font-display"
          style={{ fontSize: "var(--type-display)" }}
        >
          Design kit
        </h1>
        <p className="mt-2 text-ink-muted">
          Internal reference for tokens and components. Not shipped to
          production.
        </p>
      </div>
      <DesignKit />
    </>
  );
}
