import { isDemoMode } from "@/lib/env";

/**
 * The only place the storefront admits it is running on demo data.
 * Replaces the per-card "Provisional/Demo" labels and the page-level disclaimers.
 * Never rendered in production builds, and `pointer-events-none` so it can never block a tap.
 */
export function PreviewIndicator() {
  if (process.env.NODE_ENV === "production" || !isDemoMode()) return null;
  return (
    <p
      className="pointer-events-none fixed bottom-[calc(var(--bottom-bar-h)+0.5rem)] left-2 z-30 rounded-full bg-brand-charcoal/85 px-2.5 py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-brand-warm-white uppercase lg:bottom-2"
      role="note"
    >
      Preview data
    </p>
  );
}
