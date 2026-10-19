"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * One accessible overlay primitive for drawers, sheets and dialogs:
 * portal to <body>, focus trap, Escape to close, backdrop click, scroll lock
 * (reference-counted for nested overlays) and focus restoration.
 */
export type OverlaySide = "right" | "left" | "top" | "bottom" | "center";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let scrollLocks = 0;
function lockScroll() {
  scrollLocks += 1;
  if (scrollLocks === 1) document.body.style.overflow = "hidden";
}
function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = "";
}

const container: Record<OverlaySide, string> = {
  right: "justify-end",
  left: "justify-start",
  top: "items-start justify-center",
  bottom: "items-end justify-center",
  center: "items-center justify-center p-4",
};

const panelMotion: Record<OverlaySide, string> = {
  right: "overlay-from-right",
  left: "overlay-from-left",
  top: "overlay-from-top",
  bottom: "overlay-from-bottom",
  center: "overlay-pop",
};

export function Overlay({
  open,
  onClose,
  side = "right",
  label,
  children,
  panelClassName = "",
  initialFocusRef,
  zIndex = 60,
}: {
  open: boolean;
  onClose: () => void;
  side?: OverlaySide;
  /** Accessible name of the dialog. */
  label: string;
  children: React.ReactNode;
  panelClassName?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  zIndex?: number;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll();

    const focusFirst = () => {
      const target =
        initialFocusRef?.current ??
        panelRef.current?.querySelector<HTMLElement>(FOCUSABLE) ??
        panelRef.current;
      target?.focus();
    };
    const frame = window.requestAnimationFrame(focusFirst);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      previous?.focus?.();
    };
  }, [open, onClose, initialFocusRef]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 flex ${container[side]}`} style={{ zIndex }}>
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        className="overlay-backdrop absolute inset-0 cursor-default bg-brand-charcoal/55 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`${panelMotion[side]} relative outline-none ${panelClassName}`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
