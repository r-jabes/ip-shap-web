import Link from "next/link";
import { adminLogoutAction } from "@/app/admin/actions";
import type { AdminSession } from "@/lib/admin/session";
import { SHORT_BRAND } from "@/lib/brand";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/import", label: "Import" },
];

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-brand-warm-white text-brand-charcoal">
      <header className="border-b border-brand-dark-neutral/20 bg-brand-charcoal text-brand-warm-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div>
            <p className="font-display text-lg">{SHORT_BRAND} Admin</p>
            <p className="text-xs text-brand-warm-white/70">
              {session.email} · {session.role}
            </p>
          </div>
          <nav aria-label="Admin">
            <ul className="flex flex-wrap gap-4 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="underline-offset-4 hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/"
                  className="text-brand-warm-white/70 hover:underline"
                >
                  Storefront
                </Link>
              </li>
              <li>
                <form action={adminLogoutAction}>
                  <button
                    type="submit"
                    className="underline-offset-4 hover:underline"
                  >
                    Log out
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
