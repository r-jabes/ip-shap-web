import Image from "next/image";
import Link from "next/link";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

/**
 * Brand assets (see documentation/CONTENT_AND_IMAGES.md):
 * - `main-logo.png`           charcoal glyphs + orange accent, transparent. Use on LIGHT surfaces.
 * - `main-logo-reversed.png`  ivory glyphs + orange accent, transparent. Use on DARK surfaces.
 * - `app-icon.png`            self-contained charcoal tile with ivory glyph. Works on any surface.
 *
 * `tone` is required so the wrong variant cannot be used by accident
 * (charcoal-on-charcoal was invisible in the first prototype).
 */
export type LogoTone = "on-paper" | "on-ink";

const FULL = { width: 882, height: 256 } as const;
const MARK = { width: 158, height: 155 } as const;

type BrandLogoProps = {
  /** Surface the logo sits on. */
  tone: LogoTone;
  /** `full` = lockup with wordmark, `mark` = square emblem only. */
  variant?: "full" | "mark";
  href?: string | null;
  /** Rendered height in CSS pixels. */
  height?: number;
  priority?: boolean;
  className?: string;
};

export function logoSource(tone: LogoTone, variant: "full" | "mark") {
  if (variant === "mark") return "/branding/app-icon.png";
  return tone === "on-ink"
    ? "/branding/main-logo-reversed.png"
    : "/branding/main-logo.png";
}

export function BrandLogo({
  tone,
  variant = "full",
  href = "/",
  height = 44,
  priority = false,
  className = "",
}: BrandLogoProps) {
  const ratio = variant === "mark" ? MARK : FULL;
  const width = Math.round(height * (ratio.width / ratio.height));

  const image = (
    <Image
      src={logoSource(tone, variant)}
      alt={LEGAL_NAME}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      style={{ height, width }}
      className={`block max-w-none object-contain ${
        variant === "mark" ? "rounded-[22%]" : ""
      } ${className}`}
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-sm"
      aria-label={`${SHORT_BRAND} home`}
    >
      {image}
    </Link>
  );
}
