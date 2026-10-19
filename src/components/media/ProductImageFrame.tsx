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
  /**
   * `catalogue` keeps the 4:5 shop canvas. `none` lets the parent size the frame
   * (e.g. quick-view column that must fill full height).
   */
  aspect?: "catalogue" | "none";
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
  aspect = "catalogue",
}: ProductImageFrameProps) {
  const [failed, setFailed] = useState(false);
  const effectiveRole = image?.role ?? role;
  const aspectClass =
    aspect === "catalogue" ? CATALOGUE_ASPECT_CLASS : "relative h-full w-full";

  if (!image || failed) {
    return (
      <div
        className={`${aspectClass} flex items-center justify-center text-sm text-brand-dark-neutral ${className}`}
        style={{ backgroundColor: CATALOGUE_SURFACE }}
        role="img"
        aria-label={alt ?? "Product image unavailable"}
      >
        Image unavailable
      </div>
    );
  }

  const fitClass =
    objectFit === "cover" ? "object-cover" : "object-contain";

  return (
    <div
      className={`${aspectClass} overflow-hidden ${aspect === "none" ? "relative" : ""} ${className}`}
      style={{ backgroundColor: CATALOGUE_SURFACE }}
    >
      {aspect === "none" ? (
        <Image
          src={image.src}
          alt={alt ?? image.alt}
          fill
          priority={priority}
          quality={qualityForRole(effectiveRole)}
          sizes={sizes ?? sizesForRole(effectiveRole)}
          onError={() => setFailed(true)}
          style={{ objectPosition: position }}
          className={`${fitClass} ${imageClassName}`}
        />
      ) : (
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
          className={`h-full w-full ${fitClass} ${imageClassName}`}
        />
      )}
    </div>
  );
}
