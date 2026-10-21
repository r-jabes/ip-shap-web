import { SiteShell } from "@/components/SiteShell";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteShell>{children}</SiteShell>;
}
