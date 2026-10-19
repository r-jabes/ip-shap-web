"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import type { ProductImage } from "@/domain/product";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { ProductImageViewer } from "@/components/product/ProductImageViewer";
import { IconButton } from "@/components/ui/IconButton";
import {
  displayableImages,
  qualityForRole,
  resolveZoomSrc,
  sizesForRole,
} from "@/lib/product-image";

const SWIPE_THRESHOLD_PX = 40;
const MAGNIFY = 2.25;
const GALLERY_INTERVAL_MS = 5000;

type GallerySlide = {
  id: string;
  image: ProductImage;
  position: string;
};

/**
 * Carousel slides: real images when available; otherwise two framed views of the
 * primary (cover + photo-matched frame — full height, gentle position shift).
 */
function buildSlides(images: ProductImage[]): GallerySlide[] {
  const safe = displayableImages(images, { allowNeedsReview: true });
  if (safe.length === 0) return [];
  if (safe.length === 1) {
    const only = safe[0]!;
    return [
      { id: `${only.id}-a`, image: only, position: "50% 48%" },
      { id: `${only.id}-b`, image: only, position: "50% 54%" },
    ];
  }
  return safe.map((image) => ({
    id: image.id,
    image,
    position: "50% 50%",
  }));
}

export function ProductGallery({
  images,
  productName,
}: {
  images: ProductImage[];
  productName: string;
}) {
  const slides = useMemo(() => buildSlides(images), [images]);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [lens, setLens] = useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const pointerStartX = useRef<number | null>(null);
  const labelId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const multi = slides.length > 1;
  const autoplay = multi && !lightboxOpen && !hovered && !reducedMotion;

  const current = slides[index];

  /** Always wraps — last → first and first → last. */
  const go = useCallback(
    (direction: -1 | 1) => {
      if (!multi) return;
      setIndex((value) => (value + direction + slides.length) % slides.length);
    },
    [multi, slides.length],
  );

  useEffect(() => {
    if (index >= slides.length) setIndex(0);
  }, [index, slides.length]);

  useEffect(() => {
    setLens(null);
  }, [index]);

  // Continuous loop: each slide schedules the next, wrapping forever.
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setTimeout(() => go(1), GALLERY_INTERVAL_MS);
    return () => window.clearTimeout(id);
  }, [autoplay, index, go]);

  if (!current) {
    return <ProductImageFrame image={null} alt={`${productName} image`} />;
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerStartX.current = event.clientX;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (pointerStartX.current === null || !multi) return;
    const delta = event.clientX - pointerStartX.current;
    pointerStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    go(delta < 0 ? 1 : -1);
  };

  const onMagnifyMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setLens({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      w: rect.width,
      h: rect.height,
    });
  };

  const zoomSrc = resolveZoomSrc(current.image);
  const galleryAspect = `${current.image.width} / ${current.image.height}`;

  return (
    <div
      className="product-gallery"
      style={
        {
          "--gallery-aspect": galleryAspect,
          "--gallery-w": current.image.width,
          "--gallery-h": current.image.height,
        } as CSSProperties
      }
    >
      <div
        className="product-gallery-stage relative"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="product-gallery-arch relative overflow-hidden"
          onMouseMove={onMagnifyMove}
          onMouseLeave={() => setLens(null)}
        >
          <div key={current.id} className="gallery-crossfade">
            <ProductImageFrame
              image={current.image}
              role="catalogue_secondary"
              priority
              objectFit="cover"
              position={current.position}
              sizes={sizesForRole("catalogue_secondary")}
              className="rounded-none bg-paper-2"
              imageClassName="pointer-events-none select-none"
            />
          </div>

          {lens && !lightboxOpen ? (
            <div
              aria-hidden="true"
              className="product-gallery-lens pointer-events-none absolute z-[2] hidden overflow-hidden rounded-full border-2 border-brand-charcoal shadow-[3px_3px_0_0_var(--brand-charcoal)] lg:block"
              style={{
                width: "9rem",
                height: "9rem",
                left: clamp(lens.x - 72, 8, lens.w - 144 - 8),
                top: clamp(lens.y - 72, 8, lens.h - 144 - 8),
                backgroundImage: `url(${zoomSrc})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: `${lens.w * MAGNIFY}px ${lens.h * MAGNIFY}px`,
                backgroundPosition: `${-lens.x * MAGNIFY + 72}px ${
                  -lens.y * MAGNIFY + 72
                }px`,
              }}
            />
          ) : null}

          {multi ? (
            <div
              className="absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5"
              role="tablist"
              aria-label="Image slides"
            >
              {slides.map((slide, slideIndex) => (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={slideIndex === index}
                  aria-label={`Show image ${slideIndex + 1} of ${slides.length}`}
                  onClick={() => setIndex(slideIndex)}
                  className={`h-2 rounded-full transition-[width,background-color] duration-[var(--motion-fast)] ${
                    slideIndex === index
                      ? "w-6 bg-brand-burnt-orange"
                      : "w-2 bg-brand-warm-white/80 hover:bg-brand-warm-white"
                  }`}
                />
              ))}
            </div>
          ) : null}
        </div>

        {multi ? (
          <>
            <IconButton
              label="Previous image"
              onClick={() => go(-1)}
              size="sm"
              className="absolute top-1/2 left-3 z-[3] -translate-y-1/2 bg-brand-warm-white/95"
            >
              ‹
            </IconButton>
            <IconButton
              label="Next image"
              onClick={() => go(1)}
              size="sm"
              className="absolute top-1/2 right-3 z-[3] -translate-y-1/2 bg-brand-warm-white/95"
            >
              ›
            </IconButton>
          </>
        ) : null}

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute right-3 bottom-3 z-[3] rounded-full border-2 border-brand-charcoal bg-brand-charcoal px-4 py-2 text-xs font-semibold tracking-[0.1em] text-brand-warm-white uppercase shadow-[3px_3px_0_0_var(--brand-burnt-orange)]"
        >
          Zoom
        </button>
      </div>

      {multi && slides.length > 2 ? (
        <ul
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Thumbnails"
        >
          {slides.map((slide, slideIndex) => (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => setIndex(slideIndex)}
                aria-current={slideIndex === index ? "true" : undefined}
                aria-label={`Show image ${slideIndex + 1} of ${slides.length}`}
                className={`relative h-16 w-14 overflow-hidden rounded-[0.9rem] border-2 ${
                  slideIndex === index
                    ? "border-brand-burnt-orange"
                    : "border-brand-charcoal/20 opacity-80 hover:opacity-100"
                }`}
              >
                <Image
                  src={slide.image.src}
                  alt=""
                  width={80}
                  height={100}
                  quality={qualityForRole("thumbnail")}
                  sizes={sizesForRole("thumbnail")}
                  className="h-full w-full object-cover"
                  style={{ objectPosition: slide.position }}
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="sr-only" aria-live="polite" id={labelId}>
        Showing image {index + 1} of {slides.length} for {productName}
      </p>

      <ProductImageViewer
        open={lightboxOpen}
        onClose={() => {
          setLightboxOpen(false);
          triggerRef.current?.focus();
        }}
        image={current.image}
        productName={productName}
        index={index}
        total={slides.length}
        onPrev={() => go(-1)}
        onNext={() => go(1)}
      />
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
