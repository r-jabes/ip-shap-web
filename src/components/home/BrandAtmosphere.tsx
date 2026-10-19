/**
 * Soft warm wash only. It fades in from the top so it blends under the sticky
 * header, and it never draws lines (those clash with content at some widths).
 */
export function BrandAtmosphere({
  variant = "hero",
}: {
  variant?: "hero" | "featured";
}) {
  return (
    <div
      aria-hidden="true"
      className={`brand-atmosphere pointer-events-none absolute inset-0 overflow-hidden ${
        variant === "featured"
          ? "brand-atmosphere--featured"
          : "brand-atmosphere--hero"
      }`}
    >
      <div className="brand-atmosphere__wash absolute inset-0" />
    </div>
  );
}
