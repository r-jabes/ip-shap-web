import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";

export function PlaceholderPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
}) {
  return (
    <Container className="py-10 lg:max-w-3xl lg:py-14">
      <DemoBadge>Owner confirmation needed</DemoBadge>
      <h1 className="mt-4 font-display" style={{ fontSize: "var(--type-h2)" }}>
        {title}
      </h1>
      <p className="mt-4 text-brand-dark-neutral">{intro}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-display text-xl">{section.heading}</h2>
            <p className="mt-2 text-brand-dark-neutral">{section.body}</p>
          </section>
        ))}
      </div>
    </Container>
  );
}
