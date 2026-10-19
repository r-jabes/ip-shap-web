import Image from "next/image";
import Link from "next/link";
import { LEGAL_NAME, SHORT_BRAND } from "@/lib/brand";

type BrandLogoProps = {
  href?: string;
  /** Visual height in pixels; width follows intrinsic 882×256 ratio. */
  height?: number;
  priority?: boolean;
  className?: string;
};

export function BrandLogo({
  href = "/",
  height = 36,
  priority = false,
  className = "",
}: BrandLogoProps) {
  const width = Math.round(height * (882 / 256));

  const image = (
    <Image
      src="/branding/main-logo.png"
      alt={LEGAL_NAME}
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-auto max-w-[min(100%,11rem)] object-contain object-left sm:max-w-[13rem] ${className}`}
      sizes="(max-width: 640px) 176px, 208px"
    />
  );

  if (!href) {
    return image;
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-burnt-orange"
      aria-label={`${SHORT_BRAND} home`}
    >
      {image}
    </Link>
  );
}
