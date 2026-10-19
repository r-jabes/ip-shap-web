import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";

type Section = {
  heading: string;
  body: string;
  /** Optional index shown in story layout, e.g. "01". */
  index?: string;
};

/**
 * Shared shell for About / Delivery / legal pages.
 * `story` = numbered editorial blocks; `legal` = quieter policy sections.
 */
export function InfoPage({
  eyebrow,
  title,
  intro,
  sections,
  variant = "story",
  children,
  action,
}: {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: Section[];
  variant?: "story" | "legal";
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Container className="py-12 lg:py-16">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={`font-display text-brand-charcoal ${eyebrow ? "mt-3" : ""}`}
          style={{ fontSize: "var(--type-display)" }}
        >
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-ink-muted">{intro}</p>
      </div>

      <div
        className={`mt-12 ${
          variant === "story"
            ? "grid gap-6 md:grid-cols-2"
            : "mx-auto max-w-3xl space-y-0"
        }`}
      >
        {sections.map((section, i) =>
          variant === "story" ? (
            <Reveal key={section.heading} delayMs={i * 60} className="h-full">
              <section className="h-full rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white p-6 shadow-[4px_4px_0_0_var(--brand-charcoal)]">
                <p className="text-xs font-semibold tracking-[0.14em] text-brand-burnt-orange uppercase tabular">
                  {section.index ?? String(i + 1).padStart(2, "0")}
                </p>
                <h2 className="font-display mt-3 text-2xl text-brand-charcoal">
                  {section.heading}
                </h2>
                <p className="mt-3 text-ink-muted">{section.body}</p>
              </section>
            </Reveal>
          ) : (
            <section
              key={section.heading}
              className="border-t-2 border-brand-charcoal/15 py-6 first:border-t-0 first:pt-0"
            >
              <h2 className="font-display text-xl text-brand-charcoal">
                {section.heading}
              </h2>
              <p className="mt-2 max-w-2xl text-ink-muted">{section.body}</p>
            </section>
          ),
        )}
      </div>

      {action ? <div className="mt-12">{action}</div> : null}
      {children}
    </Container>
  );
}
