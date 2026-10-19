/**
 * Centered scroll invitation — icon only, no “SCROLL” label.
 */
export function ScrollCue({ href = "#home-collections" }: { href?: string }) {
  return (
    <a
      href={href}
      className="scroll-cue group absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-brand-charcoal/70 transition-colors duration-[var(--motion-ui)] hover:text-brand-charcoal"
      aria-label="Scroll to collections"
    >
      <span className="scroll-cue__ring flex h-10 w-6 items-start justify-center rounded-full border-2 border-current pt-1.5">
        <span className="scroll-cue__dot block h-1.5 w-1.5 rounded-full bg-current" />
      </span>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="scroll-cue__chevron"
      >
        <path
          d="m6 9 6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </a>
  );
}
