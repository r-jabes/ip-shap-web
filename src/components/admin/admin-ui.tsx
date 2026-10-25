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
    <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
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

/**
 * Desktop table. Pass `mobile` (a list of <AdminCard>) to swap the table for stacked
 * cards on small screens instead of sideways scrolling.
 */
export function AdminTable({
  children,
  mobile,
}: {
  children: ReactNode;
  mobile?: ReactNode;
}) {
  return (
    <>
      {mobile ? <ul className="space-y-3 md:hidden">{mobile}</ul> : null}
      <div
        className={`site-scroll overflow-x-auto rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15 ${mobile ? "hidden md:block" : ""}`}
      >
        <table className="min-w-full text-left text-sm">{children}</table>
      </div>
    </>
  );
}

export function AdminCard({ children }: { children: ReactNode }) {
  return (
    <li className="rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15 bg-white/50 p-4">
      {children}
    </li>
  );
}

const PILL_TONES = {
  neutral: "border-brand-charcoal/25 bg-paper-2 text-brand-charcoal",
  good: "border-brand-burnt-orange/50 bg-brand-burnt-orange/15 text-brand-charcoal",
  warn: "border-amber-600/50 bg-amber-100 text-amber-900",
  muted: "border-brand-charcoal/20 bg-brand-charcoal/5 text-ink-muted",
} as const;

export function AdminPill({
  tone = "neutral",
  children,
}: {
  tone?: keyof typeof PILL_TONES;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide whitespace-nowrap ${PILL_TONES[tone]}`}
    >
      {children}
    </span>
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
