"use client";

import { useEffect, useState } from "react";

/** Lightweight toast for storefront forms — no provider required. */
export function InlineToast({
  message,
  tone = "error",
}: {
  message: string | null | undefined;
  tone?: "error" | "success";
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 7000);
    return () => window.clearTimeout(id);
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex justify-center px-4"
      aria-live="assertive"
    >
      <p
        role="alert"
        className={`pointer-events-auto max-w-md rounded-full border-2 px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--brand-charcoal)] ${
          tone === "error"
            ? "border-brand-burnt-orange bg-brand-burnt-orange/15 text-brand-charcoal"
            : "border-brand-charcoal bg-brand-warm-white text-brand-charcoal"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
