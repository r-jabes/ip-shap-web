/**
 * Named motion tokens mirrored from `globals.css` for JS consumers/tests.
 * Keep in sync with CSS custom properties.
 */
export const MOTION = {
  fastMs: 140,
  uiMs: 220,
  editorialMs: 520,
  heroMs: 700,
  easeOut: "cubic-bezier(0.22, 1, 0.36, 1)",
  easeUi: "cubic-bezier(0.33, 1, 0.68, 1)",
  easeSoft: "cubic-bezier(0.4, 0, 0.2, 1)",
  easeSettle: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
