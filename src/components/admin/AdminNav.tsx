"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { adminLogoutAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { roleHasPermission, type AdminRole } from "@/lib/admin/roles";

const links = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/orders", label: "Orders", badge: "orders" as const },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/featured", label: "Featured" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/brands", label: "Brands" },
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

function OrdersBadge({ count, active }: { count: number; active: boolean }) {
  if (count <= 0) return null;
  const label = count > 99 ? "99+" : String(count);
  return (
    <span
      className={`ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold tabular leading-none ${
        active
          ? "bg-brand-burnt-orange text-brand-charcoal"
          : "bg-brand-burnt-orange text-brand-charcoal"
      }`}
      aria-label={`${count} new ${count === 1 ? "order" : "orders"}`}
    >
      {label}
    </span>
  );
}

function NavLinks({
  role,
  pathname,
  newOrderCount,
  onNavigate,
  className = "",
}: {
  role: AdminRole;
  pathname: string;
  newOrderCount: number;
  onNavigate?: () => void;
  className?: string;
}) {
  return (
    <ul className={className}>
      {links.map((link) => {
        if (
          "permission" in link &&
          link.permission &&
          !roleHasPermission(role, link.permission)
        ) {
          return null;
        }
        const active = isActive(pathname, link.href, "exact" in link);
        const showOrdersBadge =
          "badge" in link && link.badge === "orders" && newOrderCount > 0;
        return (
          <li key={link.href}>
            <Link
              href={link.href}
              aria-current={active ? "page" : undefined}
              onClick={onNavigate}
              className={`inline-flex h-10 min-w-[2.75rem] items-center rounded-full border-2 px-3.5 text-sm font-semibold transition-colors duration-[var(--motion-fast)] md:h-9 ${
                active
                  ? "border-brand-charcoal bg-brand-charcoal text-brand-warm-white"
                  : "border-transparent text-brand-charcoal hover:border-brand-charcoal/20 hover:bg-paper-2"
              }`}
            >
              {link.label}
              {showOrdersBadge ? (
                <OrdersBadge count={newOrderCount} active={active} />
              ) : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function UtilityActions({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Button href="/" variant="ghost" size="sm">
        Storefront
      </Button>
      <form action={adminLogoutAction}>
        <Button type="submit" variant="link" size="sm">
          Log out
        </Button>
      </form>
    </div>
  );
}

export function AdminNav({
  role,
  newOrderCount = 0,
}: {
  role: AdminRole;
  newOrderCount?: number;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <nav aria-label="Admin" className="w-full">
      <div className="hidden items-center gap-2 md:flex">
        <NavLinks
          role={role}
          pathname={pathname}
          newOrderCount={newOrderCount}
          className="flex flex-wrap items-center gap-1.5"
        />
        <UtilityActions className="ml-auto flex flex-wrap items-center gap-2" />
      </div>

      <div className="md:hidden">
        <button
          type="button"
          className="inline-flex h-11 items-center gap-2 rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-4 text-sm font-semibold shadow-[3px_3px_0_0_var(--brand-charcoal)]"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <CloseIcon size={18} /> : <MenuIcon size={18} />}
          {open ? "Close" : "Menu"}
          {!open && newOrderCount > 0 ? (
            <span
              className="ml-1 inline-flex h-2.5 w-2.5 rounded-full bg-brand-burnt-orange"
              aria-hidden="true"
            />
          ) : null}
        </button>

        {open ? (
          <div
            id={menuId}
            className="mt-3 rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-3 shadow-[4px_4px_0_0_var(--brand-charcoal)]"
          >
            <NavLinks
              role={role}
              pathname={pathname}
              newOrderCount={newOrderCount}
              onNavigate={() => setOpen(false)}
              className="flex flex-col gap-1"
            />
            <UtilityActions className="mt-3 flex flex-wrap items-center gap-2 border-t border-brand-charcoal/10 pt-3" />
          </div>
        ) : null}
      </div>
    </nav>
  );
}
