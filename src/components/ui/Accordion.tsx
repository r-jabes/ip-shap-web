"use client";

import { useId, useState, type ReactNode } from "react";

/** Single disclosure row used on FAQ and product details. */
export function Accordion({
  title,
  children,
  defaultOpen = false,
  className = "",
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={`border-t-2 border-brand-charcoal/15 ${className}`}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 py-4 text-left"
      >
        <span className="font-display text-lg text-brand-charcoal">{title}</span>
        <span aria-hidden="true" className="text-xl leading-none text-ink-muted">
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div id={panelId} className="pb-5 text-ink-muted">
          {children}
        </div>
      ) : null}
    </div>
  );
}
