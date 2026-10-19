import { Container } from "@/components/ui/Container";

export function InfoPage({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro: string;
  sections: Array<{ heading: string; body: string }>;
  children?: React.ReactNode;
}) {
  return (
    <Container className="py-12 lg:max-w-3xl lg:py-16">
      <h1 className="font-display" style={{ fontSize: "var(--type-display)" }}>
        {title}
      </h1>
      <p className="mt-4 text-lg text-ink-muted">{intro}</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.heading} className="border-t border-line pt-6">
            <h2 className="font-display text-xl">{section.heading}</h2>
            <p className="mt-2 text-ink-muted">{section.body}</p>
          </section>
        ))}
      </div>
      {children}
    </Container>
  );
}
