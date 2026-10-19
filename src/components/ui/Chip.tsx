import Link from "next/link";

type ChipProps = {
  children: React.ReactNode;
  selected?: boolean;
  /** Result count shown after the label. */
  count?: number;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  /** Renders a trailing remove glyph (for applied-filter chips). */
  removable?: boolean;
  className?: string;
  "aria-label"?: string;
};

/** Pill toggle used for options, filters and applied-filter chips. */
export function Chip({
  children,
  selected = false,
  count,
  href,
  onClick,
  disabled,
  removable,
  className = "",
  "aria-label": ariaLabel,
}: ChipProps) {
  const classes = `inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-[background-color,border-color,color] duration-[var(--motion-fast)] ease-[var(--ease-ui)] motion-reduce:transition-none ${
    selected
      ? "border-brand-charcoal bg-brand-charcoal text-brand-warm-white"
      : "border-brand-charcoal/25 bg-transparent text-brand-charcoal hover:border-brand-charcoal"
  } ${disabled ? "pointer-events-none opacity-40" : ""} ${className}`;

  const body = (
    <>
      <span>{children}</span>
      {typeof count === "number" ? (
        <span
          className={`text-xs tabular ${selected ? "text-brand-warm-white/70" : "text-ink-muted"}`}
        >
          {count}
        </span>
      ) : null}
      {removable ? (
        <span aria-hidden="true" className="-mr-1 text-base leading-none">
          ×
        </span>
      ) : null}
    </>
  );

  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={classes}
        aria-current={selected ? "true" : undefined}
        aria-label={ariaLabel}
      >
        {body}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={onClick ? selected : undefined}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
    >
      {body}
    </button>
  );
}
