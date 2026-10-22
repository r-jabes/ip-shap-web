import { headers } from "next/headers";
import { AgeGate } from "@/components/age/AgeGate";
import { SiteShell } from "@/components/SiteShell";
import { shouldShowAgeGate } from "@/lib/age-gate";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerStore = await headers();
  const ua = headerStore.get("user-agent");
  const showGate = await shouldShowAgeGate(ua);
  const path = headerStore.get("x-pathname") ?? headerStore.get("x-url") ?? "/";
  const returnTo =
    path.startsWith("http") || path.startsWith("/")
      ? path.replace(/^https?:\/\/[^/]+/, "") || "/"
      : "/";

  // Humans without cookie: age gate only (no header/footer — those looked like an empty site).
  // Crawlers: full page, no gate.
  if (showGate) {
    return <AgeGate returnTo={returnTo} />;
  }

  return <SiteShell>{children}</SiteShell>;
}
