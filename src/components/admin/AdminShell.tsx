import { BrandLogo } from "@/components/brand/BrandLogo";
import { AdminNav } from "@/components/admin/AdminNav";
import { AdminToastProvider } from "@/components/admin/AdminToast";
import type { AdminSession } from "@/lib/admin/session";

const ROLE_LABEL = { owner: "Owner", manager: "Manager", staff: "Staff" } as const;

export function AdminShell({
  session,
  newOrderCount = 0,
  children,
}: {
  session: AdminSession;
  newOrderCount?: number;
  children: React.ReactNode;
}) {
  return (
    <AdminToastProvider>
      <div className="min-h-screen overflow-x-clip bg-brand-warm-white text-brand-charcoal">
        <header className="sticky top-0 z-20 border-b-2 border-brand-charcoal/10 bg-brand-warm-white/95 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
            <div className="flex min-w-0 items-center gap-3">
              <BrandLogo tone="on-paper" height={32} href="/admin" />
              <div className="min-w-0 border-l-2 border-brand-charcoal/15 pl-3">
                <p className="font-display text-lg leading-none">Admin</p>
                <p className="mt-1 truncate text-xs text-ink-muted">
                  {session.email} · {ROLE_LABEL[session.role]}
                </p>
              </div>
            </div>
            <AdminNav role={session.role} newOrderCount={newOrderCount} />
          </div>
        </header>
        <main className="mx-auto w-full min-w-0 max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          {children}
        </main>
      </div>
    </AdminToastProvider>
  );
}
