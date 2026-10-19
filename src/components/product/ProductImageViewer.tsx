"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import type { ProductImage } from "@/domain/product";
import { IconButton } from "@/components/ui/IconButton";
import { Overlay } from "@/components/ui/Overlay";
import {
  qualityForRole,
  resolveZoomSrc,
  sizesForRole,
} from "@/lib/product-image";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_MS = 280;

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Full-screen product image viewer: wheel / pinch / drag / double-tap zoom,
 * keyboard controls, focus trap via Overlay, high-res swap via zoomSrc.
 */
export function ProductImageViewer({
  open,
  onClose,
  image,
  productName,
  index,
  total,
  onPrev,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  image: ProductImage;
  productName: string;
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 });
  const dragRef = useRef<{
    pointerId: number;
    start: Point;
    origin: Point;
  } | null>(null);
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null);
  const lastTapRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);

  const resetView = useCallback(() => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (open) resetView();
  }, [open, image.id, resetView]);

  const zoomBy = useCallback((delta: number, around?: Point) => {
    setScale((prev) => {
      const next = clamp(prev + delta, MIN_SCALE, MAX_SCALE);
      if (next === 1) setOffset({ x: 0, y: 0 });
      else if (around && stageRef.current) {
        const rect = stageRef.current.getBoundingClientRect();
        const cx = around.x - rect.width / 2;
        const cy = around.y - rect.height / 2;
        setOffset((off) => ({
          x: off.x - cx * (next / prev - 1),
          y: off.y - cy * (next / prev - 1),
        }));
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        zoomBy(0.35);
      } else if (event.key === "-" || event.key === "_") {
        event.preventDefault();
        zoomBy(-0.35);
      } else if (event.key === "0") {
        event.preventDefault();
        resetView();
      } else if (event.key === "ArrowRight" && total > 1 && scale <= 1.05) {
        event.preventDefault();
        onNext();
      } else if (event.key === "ArrowLeft" && total > 1 && scale <= 1.05) {
        event.preventDefault();
        onPrev();
      } else if (event.key === "ArrowRight" && scale > 1) {
        event.preventDefault();
        setOffset((off) => ({ ...off, x: off.x - 40 }));
      } else if (event.key === "ArrowLeft" && scale > 1) {
        event.preventDefault();
        setOffset((off) => ({ ...off, x: off.x + 40 }));
      } else if (event.key === "ArrowUp" && scale > 1) {
        event.preventDefault();
        setOffset((off) => ({ ...off, y: off.y + 40 }));
      } else if (event.key === "ArrowDown" && scale > 1) {
        event.preventDefault();
        setOffset((off) => ({ ...off, y: off.y - 40 }));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, zoomBy, resetView, onNext, onPrev, total, scale]);

  const onWheel = (event: ReactWheelEvent) => {
    event.preventDefault();
    const rect = stageRef.current?.getBoundingClientRect();
    const around = rect
      ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
      : undefined;
    zoomBy(event.deltaY > 0 ? -0.2 : 0.2, around);
  };

  const onPointerDown = (event: ReactPointerEvent) => {
    if (event.pointerType === "touch") {
      const touches = event.currentTarget.hasPointerCapture?.(event.pointerId);
      void touches;
    }

    const now = Date.now();
    if (now - lastTapRef.current < DOUBLE_TAP_MS && event.isPrimary) {
      lastTapRef.current = 0;
      if (scale > 1.1) resetView();
      else {
        const rect = stageRef.current?.getBoundingClientRect();
        zoomBy(
          1.5,
          rect
            ? { x: event.clientX - rect.left, y: event.clientY - rect.top }
            : undefined,
        );
      }
      return;
    }
    lastTapRef.current = now;

    if (scale <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      start: { x: event.clientX, y: event.clientY },
      origin: offset,
    };
  };

  const onPointerMove = (event: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setOffset({
      x: drag.origin.x + (event.clientX - drag.start.x),
      y: drag.origin.y + (event.clientY - drag.start.y),
    });
  };

  const onPointerUp = (event: ReactPointerEvent) => {
    if (dragRef.current?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  };

  // Pinch via native touch listeners on the stage (React pointer events are 1:1).
  useEffect(() => {
    const el = stageRef.current;
    if (!open || !el) return;

    const distance = (a: Touch, b: Touch) =>
      Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        pinchRef.current = {
          distance: distance(event.touches[0]!, event.touches[1]!),
          scale,
        };
      }
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length !== 2 || !pinchRef.current) return;
      event.preventDefault();
      const ratio =
        distance(event.touches[0]!, event.touches[1]!) /
        pinchRef.current.distance;
      const next = clamp(pinchRef.current.scale * ratio, MIN_SCALE, MAX_SCALE);
      setScale(next);
      if (next === 1) setOffset({ x: 0, y: 0 });
    };
    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [open, scale]);

  return (
    <Overlay
      open={open}
      onClose={onClose}
      side="center"
      label={`Zoomed image of ${productName}`}
      zIndex={70}
      panelClassName="flex h-[100dvh] w-[100vw] max-h-[100dvh] max-w-[100vw] flex-col bg-brand-charcoal text-brand-warm-white"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <p className="text-xs font-semibold tracking-[0.14em] uppercase">
          {total > 1 ? `${index + 1} / ${total}` : "Zoom"}
        </p>
        <div className="flex items-center gap-2">
          <IconButton
            label="Zoom out"
            onClick={() => zoomBy(-0.35)}
            size="sm"
            tone="on-dark"
          >
            −
          </IconButton>
          <IconButton
            label="Zoom in"
            onClick={() => zoomBy(0.35)}
            size="sm"
            tone="on-dark"
          >
            +
          </IconButton>
          <IconButton
            label="Reset zoom"
            onClick={resetView}
            size="sm"
            tone="on-dark"
          >
            1×
          </IconButton>
          <button
            type="button"
            onClick={onClose}
            className="ml-1 text-sm underline underline-offset-4"
          >
            Close
          </button>
        </div>
      </div>

      <div
        ref={stageRef}
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: scale > 1 ? "grab" : "zoom-in" }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center will-change-transform motion-reduce:transition-none"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`,
          }}
        >
          <div className="relative h-[min(86dvh,52rem)] w-[min(92vw,36rem)] max-w-full">
            <Image
              key={image.id}
              src={resolveZoomSrc(image)}
              alt={image.alt}
              fill
              className="object-contain select-none"
              sizes={sizesForRole("zoom")}
              quality={qualityForRole("zoom")}
              priority
              draggable={false}
            />
          </div>
        </div>
      </div>

      {total > 1 ? (
        <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <button
            type="button"
            onClick={() => {
              resetView();
              onPrev();
            }}
            className="text-sm underline underline-offset-4"
          >
            Previous
          </button>
          <p className="text-xs text-brand-warm-white/70">
            Scroll or pinch to zoom · drag to pan · Esc to close
          </p>
          <button
            type="button"
            onClick={() => {
              resetView();
              onNext();
            }}
            className="text-sm underline underline-offset-4"
          >
            Next
          </button>
        </div>
      ) : (
        <p className="px-4 py-4 text-center text-xs text-brand-warm-white/70 sm:px-6">
          Scroll or pinch to zoom · drag to pan · Esc to close
        </p>
      )}
    </Overlay>
  );
}
