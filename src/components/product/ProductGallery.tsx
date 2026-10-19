"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import type { ProductImage } from "@/domain/product";

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const safeImages = images.length > 0 ? images : [];
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const labelId = useId();

  const current = safeImages[index];

  useEffect(() => {
    if (!lightboxOpen) return;
    const triggerNode = triggerRef.current;
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") {
        setIndex((value) => (value + 1) % safeImages.length);
      }
      if (event.key === "ArrowLeft") {
        setIndex(
          (value) => (value - 1 + safeImages.length) % safeImages.length,
        );
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      triggerNode?.focus();
    };
  }, [lightboxOpen, safeImages.length]);

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center bg-[#E8E2D6] text-sm text-brand-dark-neutral">
        Image unavailable
      </div>
    );
  }

  const go = (direction: -1 | 1) => {
    setIndex(
      (value) => (value + direction + safeImages.length) % safeImages.length,
    );
  };

  return (
    <div>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#E8E2D6]">
        <Image
          src={current.src}
          alt={current.alt}
          width={current.width}
          height={current.height}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="h-full w-full object-contain"
        />
        {safeImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-3 -translate-y-1/2 bg-brand-warm-white/90 px-3 py-2 text-sm"
              aria-label="Previous image"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-3 -translate-y-1/2 bg-brand-warm-white/90 px-3 py-2 text-sm"
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
                aria-label={`Show image ${imageIndex + 1}`}
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

      {lightboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/90 p-4">
          <div
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
            <div className="relative aspect-[4/5] bg-brand-dark-neutral">
              <Image
                src={current.src}
                alt={current.alt}
                fill
                className="object-contain"
                sizes="90vw"
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
