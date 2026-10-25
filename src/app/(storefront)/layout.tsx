import { AgeGate } from "@/components/age/AgeGate";
import { SiteShell } from "@/components/SiteShell";

/**
 * No cookies or headers are read here, so storefront pages can be built once and served from
 * the CDN. The age gate is decided in the browser (see `AgeGate`).
 */
export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteShell>{children}</SiteShell>
      <AgeGate />
    </>
  );
}
