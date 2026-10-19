type Tone = "neutral" | "accent" | "ink" | "outline";

const tones: Record<Tone, string> = {
  neutral: "bg-paper-2 text-brand-charcoal",
  accent: "bg-brand-burnt-orange text-brand-charcoal",
  ink: "bg-brand-charcoal text-brand-warm-white",
  outline: "border border-brand-charcoal/30 text-brand-charcoal",
};

/** Small status label. Text always carries the meaning; colour is secondary. */
export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.68rem] leading-none font-semibold tracking-[0.08em] uppercase ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
