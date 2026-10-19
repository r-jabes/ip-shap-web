"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay after intersection before applying visible class (ms). */
  delayMs?: number;
};

/**
 * One-time editorial reveal via IntersectionObserver.
 * Content stays visible without JS / under reduced motion — no content gated on animation.
 */
export function Reveal({ children, className = "", delayMs = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [motionOn, setMotionOn] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    setMotionOn(true);

    const node = ref.current;
    if (!node) return;

    let timeoutId: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        timeoutId = window.setTimeout(() => setVisible(true), delayMs);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, [delayMs]);

  const stateClass = !motionOn
    ? "reveal"
    : visible
      ? "reveal reveal--visible"
      : "reveal reveal--pending";

  return (
    <div ref={ref} className={`${stateClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
