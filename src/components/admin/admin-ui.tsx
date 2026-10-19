import type { ReactNode } from "react";

/** Shared visual primitives for the admin restyle (R8). No new behaviour. */

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">
          Admin
        </p>
        <h1
          className="font-display mt-1 text-brand-charcoal"
          style={{ fontSize: "clamp(1.75rem, 1.3rem + 1.5vw, 2.5rem)" }}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm text-ink-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-5 shadow-[4px_4px_0_0_var(--brand-charcoal)] sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminStat({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <li className="rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15 bg-white/50 px-4 py-5">
      <p className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
        {label}
      </p>
      <p className="font-display mt-2 text-3xl text-brand-charcoal tabular">
        {value}
      </p>
    </li>
  );
}

export function AdminStatus({ children }: { children: ReactNode }) {
  return (
    <p
      className="rounded-full border border-brand-burnt-orange/40 bg-brand-burnt-orange/10 px-4 py-2 text-sm text-brand-charcoal"
      role="status"
    >
      {children}
    </p>
  );
}

export function AdminTable({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function AdminTh({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`bg-paper-2/80 px-3 py-3 text-xs font-semibold tracking-[0.1em] text-ink-muted uppercase first:pl-4 last:pr-4 ${className}`}
    >
      {children}
    </th>
  );
}

export function AdminTd({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-t border-brand-charcoal/10 px-3 py-3 first:pl-4 last:pr-4 ${className}`}
    >
      {children}
    </td>
  );
}
