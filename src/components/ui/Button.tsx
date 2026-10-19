import Link from "next/link";

type Variant = "primary" | "secondary" | "ghost" | "on-dark";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-burnt-orange text-brand-charcoal hover:brightness-105 active:brightness-95",
  secondary:
    "bg-brand-charcoal text-brand-warm-white hover:bg-brand-dark-neutral",
  ghost:
    "bg-transparent text-brand-charcoal border border-brand-charcoal/25 hover:border-brand-charcoal",
  "on-dark":
    "bg-brand-warm-white text-brand-charcoal hover:bg-brand-burnt-orange",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm px-5 py-3 text-sm font-medium tracking-[0.04em] transition-[transform,background-color,filter,border-color] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  href,
  children,
  variant = "primary",
  className = "",
  type = "button",
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: {
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    const external = /^https?:\/\//.test(href);
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={ariaLabel}
          onClick={onClick}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
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
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
