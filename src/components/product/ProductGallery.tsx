"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ProductImage } from "@/domain/product";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import {
  CATALOGUE_SURFACE,
  displayableImages,
  qualityForRole,
  resolveZoomSrc,
  sizesForRole,
} from "@/lib/product-image";

const SWIPE_THRESHOLD_PX = 40;

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const safeImages = displayableImages(images, { allowNeedsReview: true });
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef<number | null>(null);
  const labelId = useId();

  const current = safeImages[index];

  const go = useCallback(
    (direction: -1 | 1) => {
      if (safeImages.length <= 1) return;
      setIndex(
        (value) => (value + direction + safeImages.length) % safeImages.length,
      );
    },
    [safeImages.length],
  );

  useEffect(() => {
    if (index >= safeImages.length) {
      setIndex(0);
    }
  }, [index, safeImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const triggerNode = triggerRef.current;
    const dialog = dialogRef.current;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightboxOpen(false);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        go(1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        go(-1);
      }
      if (event.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      triggerNode?.focus();
    };
  }, [lightboxOpen, go]);

  if (!current) {
    return <ProductImageFrame image={null} alt={`${productName} image`} />;
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null || safeImages.length <= 1) return;
    const delta = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? 1 : -1);
  };

  return (
    <div>
      <div
        className="relative"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        <ProductImageFrame
          image={current}
          role="catalogue_secondary"
          priority
          objectFit="contain"
          sizes={sizesForRole("catalogue_secondary")}
          imageClassName="pointer-events-none select-none"
        />
        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-brand-warm-white/90 px-3 py-2 text-sm transition-opacity duration-200"
              aria-label="Previous image"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-brand-warm-white/90 px-3 py-2 text-sm transition-opacity duration-200"
              aria-label="Next image"
            >
              Next
            </button>
          </>
        ) : null}
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 bottom-3 bg-brand-charcoal px-3 py-2 text-xs tracking-[0.08em] text-brand-warm-white uppercase"
        >
          Zoom
        </button>
      </div>

      {safeImages.length > 1 ? (
        <ul
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Thumbnails"
        >
          {safeImages.map((image, imageIndex) => (
            <li key={image.id}>
              <button
                type="button"
                onClick={() => setIndex(imageIndex)}
                aria-current={imageIndex === index ? "true" : undefined}
                aria-label={`Show image ${imageIndex + 1} of ${safeImages.length}`}
                className={`relative h-20 w-16 overflow-hidden border ${
                  imageIndex === index
                    ? "border-brand-burnt-orange"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={image.src}
                  alt=""
                  width={80}
                  height={100}
                  quality={qualityForRole("thumbnail")}
                  sizes={sizesForRole("thumbnail")}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="sr-only" aria-live="polite" id={labelId}>
        Showing image {index + 1} of {safeImages.length} for {productName}
      </p>

      {current.isSharedMultiProductPhoto ? (
        <p className="mt-2 text-xs text-brand-dark-neutral">
          Shared multi-product photograph — pending individual SKU photo.
        </p>
      ) : null}

      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/90 p-4">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={`Zoomed image of ${productName}`}
            className="relative max-h-[90vh] w-full max-w-3xl"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute -top-12 right-0 text-sm text-brand-warm-white underline"
            >
              Close
            </button>
            <div
              className="relative aspect-[4/5]"
              style={{ backgroundColor: CATALOGUE_SURFACE }}
              onPointerDown={onPointerDown}
              onPointerUp={onPointerUp}
            >
              {/* Zoom asset mounts only while lightbox is open. */}
              <Image
                src={resolveZoomSrc(current)}
                alt={current.alt}
                fill
                className="object-contain"
                sizes={sizesForRole("zoom")}
                quality={qualityForRole("zoom")}
                priority
              />
            </div>
            {safeImages.length > 1 ? (
              <div className="mt-3 flex justify-between text-sm text-brand-warm-white">
                <button type="button" onClick={() => go(-1)}>
                  Previous
                </button>
                <span>
                  {index + 1} / {safeImages.length}
                </span>
                <button type="button" onClick={() => go(1)}>
                  Next
                </button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
