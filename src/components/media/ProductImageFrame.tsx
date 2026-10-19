"use client";

import Image from "next/image";
import { useState } from "react";
import type { ProductImage, ProductImageRole } from "@/domain/product";
import {
  CATALOGUE_ASPECT_CLASS,
  CATALOGUE_SURFACE,
  qualityForRole,
  sizesForRole,
} from "@/lib/product-image";

type ProductImageFrameProps = {
  image?: ProductImage | null;
  role?: ProductImageRole;
  alt?: string;
  priority?: boolean;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  /** When true, uses cover; default contain for label safety on shop photos. */
  objectFit?: "contain" | "cover";
  /** CSS object-position, e.g. "50% 40%". */
  position?: string;
};

export function ProductImageFrame({
  image,
  role = "catalogue_primary",
  alt,
  priority = false,
  className = "",
  imageClassName = "",
  sizes,
  objectFit = "contain",
  position = "center",
}: ProductImageFrameProps) {
  const [failed, setFailed] = useState(false);
  const effectiveRole = image?.role ?? role;

  if (!image || failed) {
    return (
      <div
        className={`${CATALOGUE_ASPECT_CLASS} flex items-center justify-center text-sm text-brand-dark-neutral ${className}`}
        style={{ backgroundColor: CATALOGUE_SURFACE }}
        role="img"
        aria-label={alt ?? "Product image unavailable"}
      >
        Image unavailable
      </div>
    );
  }

  return (
    <div
      className={`${CATALOGUE_ASPECT_CLASS} relative overflow-hidden ${className}`}
      style={{ backgroundColor: CATALOGUE_SURFACE }}
    >
      <Image
        src={image.src}
        alt={alt ?? image.alt}
        width={image.width}
        height={image.height}
        priority={priority}
        quality={qualityForRole(effectiveRole)}
        sizes={sizes ?? sizesForRole(effectiveRole)}
        onError={() => setFailed(true)}
        style={{ objectPosition: position }}
        className={`h-full w-full ${
          objectFit === "cover" ? "object-cover" : "object-contain"
        } ${imageClassName}`}
      />
    </div>
  );
}
