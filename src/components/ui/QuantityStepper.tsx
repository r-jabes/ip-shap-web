"use client";

import { MinusIcon, PlusIcon } from "@/components/ui/icons";

/** Controlled +/- stepper. Announces value changes via the live region on the output. */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  label = "Quantity",
  size = "md",
  disabled = false,
  className = "",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
}) {
  const dim = size === "sm" ? "h-9 w-9" : "h-11 w-11";
  const btn = `${dim} inline-flex items-center justify-center rounded-full text-brand-charcoal transition-colors duration-[var(--motion-fast)] hover:bg-paper-2 disabled:pointer-events-none disabled:opacity-35`;

  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex items-center rounded-full border-2 border-brand-charcoal bg-transparent ${className}`}
    >
      <button
        type="button"
        className={btn}
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <MinusIcon size={16} />
      </button>
      <output
        aria-live="polite"
        className={`min-w-8 text-center font-semibold tabular ${size === "sm" ? "text-sm" : "text-base"}`}
      >
        {value}
      </output>
      <button
        type="button"
        className={btn}
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <PlusIcon size={16} />
      </button>
    </div>
  );
}
