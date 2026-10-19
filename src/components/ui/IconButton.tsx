import Link from "next/link";

type Tone = "ghost" | "solid" | "accent" | "on-dark";

const tones: Record<Tone, string> = {
  ghost:
    "border-brand-charcoal/25 bg-transparent text-brand-charcoal hover:border-brand-charcoal hover:bg-paper-2",
  solid:
    "border-brand-charcoal bg-brand-charcoal text-brand-warm-white hover:bg-brand-dark-neutral",
  accent:
    "border-brand-charcoal bg-brand-burnt-orange text-brand-charcoal hover:brightness-105",
  "on-dark":
    "border-brand-warm-white/30 bg-transparent text-brand-warm-white hover:border-brand-warm-white hover:bg-brand-warm-white/10",
};

const sizes = { sm: "h-10 w-10", md: "h-11 w-11", lg: "h-12 w-12" } as const;

type IconButtonProps = {
  /** Required accessible name (icon-only control). */
  label: string;
  children: React.ReactNode;
  tone?: Tone;
  size?: keyof typeof sizes;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
  "aria-expanded"?: boolean;
  "aria-controls"?: string;
  "aria-haspopup"?: "dialog" | "menu" | boolean;
};

export function IconButton({
  label,
  children,
  tone = "ghost",
  size = "md",
  href,
  onClick,
  disabled,
  className = "",
  type = "button",
  ...aria
}: IconButtonProps) {
  const classes = `relative inline-flex shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,transform,filter] duration-[var(--motion-fast)] ease-[var(--ease-ui)] active:scale-95 disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:active:scale-100 ${sizes[size]} ${tones[tone]} ${className}`;

  if (href) {
    const external = /^(https?:|mailto:|tel:)/.test(href);
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          aria-label={label}
          {...(href.startsWith("http")
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        className={classes}
        aria-label={label}
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
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      {...aria}
    >
      {children}
    </button>
  );
}
