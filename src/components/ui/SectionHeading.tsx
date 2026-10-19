/** Numbered section heading: "01 / Collections" eyebrow + display title + optional intro. */
export function SectionHeading({
  index,
  eyebrow,
  title,
  intro,
  as: Tag = "h2",
  tone = "paper",
  className = "",
  action,
}: {
  index?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  as?: "h1" | "h2" | "h3";
  tone?: "paper" | "ink";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      className={`flex flex-col gap-4 md:flex-row md:items-end md:justify-between ${className}`}
    >
      <div>
        <p
          className={`flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase ${
            tone === "ink" ? "text-brand-burnt-orange" : "text-ink-muted"
          }`}
        >
          {index ? (
            <span
              className={`tabular ${tone === "ink" ? "text-brand-warm-white" : "text-brand-charcoal"}`}
            >
              {index}
            </span>
          ) : null}
          <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
          {eyebrow}
        </p>
        <Tag
          className="font-display mt-3 text-balance"
          style={{ fontSize: "var(--type-h2)" }}
        >
          {title}
        </Tag>
        {intro ? (
          <p
            className={`mt-3 max-w-xl ${
              tone === "ink" ? "text-brand-warm-white/75" : "text-ink-muted"
            }`}
          >
            {intro}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
