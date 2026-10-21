"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminLogoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { roleHasPermission, type AdminRole } from "@/lib/admin/roles";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/import", label: "Import", permission: "import:run" as const },
  {
    href: "/admin/team",
    label: "Team",
    permission: "admins:manage" as const,
  },
] as const;

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav({ role }: { role: AdminRole }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-wrap items-center gap-2">
      <ul className="flex flex-wrap items-center gap-1.5">
        {links.map((link) => {
          if (
            "permission" in link &&
            link.permission &&
            !roleHasPermission(role, link.permission)
          ) {
            return null;
          }
          const active = isActive(pathname, link.href, "exact" in link);
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-9 items-center rounded-full border-2 px-3.5 text-sm font-semibold transition-colors duration-[var(--motion-fast)] ${
                  active
                    ? "border-brand-charcoal bg-brand-charcoal text-brand-warm-white"
                    : "border-transparent text-brand-charcoal hover:border-brand-charcoal/20 hover:bg-paper-2"
                }`}
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="ml-auto flex flex-wrap items-center gap-2">
        <Button href="/" variant="ghost" size="sm">
          Storefront
        </Button>
        <form action={adminLogoutAction}>
          <Button type="submit" variant="link" size="sm">
            Log out
          </Button>
        </form>
      </div>
    </nav>
  );
}
