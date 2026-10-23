"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { CloseIcon } from "@/components/ui/icons";

/**
 * Trigger button + native <dialog> modal. Content mounts only while open, so
 * every opening starts with a fresh form. Children may be a render function
 * that receives `close`.
 */
export function AdminModal({
  triggerLabel,
  triggerVariant = "primary",
  triggerSize = "sm",
  triggerClassName = "",
  title,
  description,
  defaultOpen = false,
  width = "md",
  children,
}: {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  triggerClassName?: string;
  title: string;
  description?: string;
  defaultOpen?: boolean;
  width?: "sm" | "md" | "lg";
  children: ReactNode | ((close: () => void) => ReactNode);
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const titleId = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const maxWidth =
    width === "sm" ? "max-w-md" : width === "lg" ? "max-w-3xl" : "max-w-xl";

  return (
    <>
      <Button
        variant={triggerVariant}
        size={triggerSize}
        className={triggerClassName}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className={`fixed inset-0 m-auto h-fit max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] ${maxWidth} overflow-y-auto rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-0 text-left text-brand-charcoal shadow-[6px_6px_0_0_var(--brand-charcoal)] backdrop:bg-brand-charcoal/60`}
      >
        {open ? (
          <div className="p-5 text-left sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 text-left">
                <h2 id={titleId} className="font-display text-left text-2xl">
                  {title}
                </h2>
                {description ? (
                  <p className="mt-1.5 text-left text-sm text-ink-muted">
                    {description}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-transparent text-brand-charcoal hover:border-brand-charcoal/20 hover:bg-paper-2"
              >
                <CloseIcon size={18} />
              </button>
            </div>
            <div className="mt-6">
              {typeof children === "function" ? children(close) : children}
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}
