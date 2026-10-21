import { BrandLogo } from "@/components/brand/BrandLogo";
import { AdminNav } from "@/components/admin/AdminNav";
import type { AdminSession } from "@/lib/admin/session";

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-warm-white text-brand-charcoal">
      <header className="sticky top-0 z-20 border-b-2 border-brand-charcoal/10 bg-brand-warm-white/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <BrandLogo tone="on-paper" height={36} href="/admin" />
              <div className="border-l-2 border-brand-charcoal/15 pl-3">
                <p className="font-display text-lg leading-none">Admin</p>
                <p className="mt-1 text-xs text-ink-muted">
                  {session.email} · {session.role}
                </p>
              </div>
            </div>
          </div>
          <AdminNav role={session.role} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
