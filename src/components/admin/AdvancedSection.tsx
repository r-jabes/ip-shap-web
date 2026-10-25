import type { ReactNode } from "react";

/** Collapsed-by-default block for rarely needed fields. */
export function AdvancedSection({
  children,
  title = "Advanced options",
  hint,
}: {
  children: ReactNode;
  title?: string;
  hint?: string;
}) {
  return (
    <details className="group rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15 bg-white/40 px-4 py-3">
      <summary className="flex min-h-10 cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold select-none [&::-webkit-details-marker]:hidden">
        <span>
          {title}
          {hint ? (
            <span className="ml-2 font-normal text-ink-muted">{hint}</span>
          ) : null}
        </span>
        <span
          aria-hidden="true"
          className="text-ink-muted transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="mt-3 grid gap-4 pb-1">{children}</div>
    </details>
  );
}
