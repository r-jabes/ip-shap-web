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
        className={`pointer-events-auto max-w-md rounded-full border-2 px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_rgba(0,0,0,0.2)] ${
          tone === "error"
            ? "border-red-700 bg-red-100 text-red-950"
            : "border-emerald-700 bg-emerald-100 text-emerald-950"
        }`}
      >
        {message}
      </p>
    </div>
  );
}
