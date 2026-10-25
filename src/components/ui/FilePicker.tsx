"use client";

import { useState, type ChangeEvent } from "react";

/**
 * Styled file chooser. A real `<input type="file">` stays underneath (so it works inside normal
 * forms, with the keyboard and with screen readers); the visible part is a button plus the
 * chosen file name. Pair it with a `Field` that uses the same `id`.
 */
export function FilePicker({
  id,
  name,
  accept,
  buttonLabel = "Choose file",
  emptyText = "No file chosen",
  describedBy,
  required = false,
  resetAfterPick = false,
  onPick,
}: {
  required?: boolean;
  id: string;
  name?: string;
  accept?: string;
  buttonLabel?: string;
  emptyText?: string;
  describedBy?: string;
  /** Clears the input after each pick so the same file can be chosen again. Only for read-in-browser uses. */
  resetAfterPick?: boolean;
  onPick?: (file: File | null) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;
    setFileName(file?.name ?? null);
    onPick?.(file);
    if (resetAfterPick) input.value = "";
  }

  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        required={required}
        aria-describedby={describedBy}
        onChange={onChange}
        className="peer sr-only"
      />
      <label
        htmlFor={id}
        className="flex min-h-[3.5rem] cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-brand-charcoal/30 bg-white/60 px-3 py-2 transition-[border-color,background-color] duration-[var(--motion-fast)] hover:border-brand-charcoal hover:bg-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)]"
      >
        <span className="inline-flex h-10 shrink-0 items-center rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-4 text-sm font-semibold text-brand-charcoal shadow-[2px_2px_0_0_var(--brand-charcoal)]">
          {buttonLabel}
        </span>
        <span
          className={`min-w-0 flex-1 truncate text-left text-sm ${fileName ? "font-semibold text-brand-charcoal" : "text-ink-muted"}`}
        >
          {fileName ?? emptyText}
        </span>
      </label>
    </div>
  );
}
