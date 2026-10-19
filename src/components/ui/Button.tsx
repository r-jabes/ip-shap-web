import Link from "next/link";
import type { MouseEvent } from "react";

/**
 * Sticker button: pill shape, 2px ink border, hard offset shadow that "presses"
 * on active. One component for links and buttons.
 *
 * Variants map to surfaces:
 * - primary   orange fill (main action on any surface)
 * - secondary charcoal fill (strong action on light surfaces)
 * - ghost     outlined (secondary action on light surfaces)
 * - on-dark   ivory fill (action on charcoal surfaces)
 * - link      text only with underline
 */
export type ButtonVariant =
  "primary" | "secondary" | "ghost" | "on-dark" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const sticker =
  "border-2 shadow-[3px_3px_0_0_var(--sticker)] hover:-translate-x-px hover:-translate-y-px hover:shadow-[5px_5px_0_0_var(--sticker)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0_0_var(--sticker)]";

const variantClasses: Record<ButtonVariant, string> = {
  primary: `${sticker} [--sticker:var(--brand-charcoal)] border-brand-charcoal bg-brand-burnt-orange text-brand-charcoal`,
  secondary: `${sticker} [--sticker:var(--brand-burnt-orange)] border-brand-charcoal bg-brand-charcoal text-brand-warm-white`,
  ghost: `${sticker} [--sticker:var(--brand-charcoal)] border-brand-charcoal bg-transparent text-brand-charcoal hover:bg-paper-2`,
  "on-dark": `${sticker} [--sticker:var(--brand-burnt-orange)] border-brand-warm-white bg-brand-warm-white text-brand-charcoal`,
  link: "bg-transparent px-1 text-current underline decoration-2 underline-offset-[6px] decoration-brand-burnt-orange hover:decoration-current",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-10 gap-1.5 px-4 text-sm",
  md: "h-12 gap-2 px-6 text-[0.95rem]",
  lg: "h-14 gap-2.5 px-8 text-base",
};

const base =
  "inline-flex select-none items-center justify-center rounded-full font-semibold tracking-[0.01em] whitespace-nowrap transition-[transform,box-shadow,background-color,border-color] duration-[var(--motion-ui)] ease-[var(--ease-ui)] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-x-0 motion-reduce:hover:translate-y-0";

export type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  type?: "button" | "submit";
  onClick?: (event: MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  /** Shows a spinner and blocks interaction; announce state elsewhere. */
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  "aria-label"?: string;
};

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none"
    />
  );
}

export function Button({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  onClick,
  disabled,
  loading = false,
  iconLeft,
  iconRight,
  "aria-label": ariaLabel,
}: ButtonProps) {
  const sizing = variant === "link" ? "gap-1.5 text-sm" : sizeClasses[size];
  const classes = `${base} ${sizing} ${variantClasses[variant]} ${className}`;
  const content = (
    <>
      {loading ? <Spinner /> : iconLeft}
      {children}
      {!loading ? iconRight : null}
    </>
  );

  if (href) {
    const isWebUrl = /^https?:\/\//.test(href);
    const isProtocol = /^(mailto:|tel:)/.test(href);
    if (isWebUrl || isProtocol) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          onClick={onClick}
          {...(isWebUrl
            ? { rel: "noopener noreferrer", target: "_blank" }
            : {})}
        >
          {content}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={classes}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      aria-label={ariaLabel}
    >
      {content}
    </button>
  );
}
