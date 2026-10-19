import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-brand-burnt-orange uppercase">
        Lost the bottle
      </p>
      <p
        className="font-display mt-4 text-brand-charcoal"
        style={{ fontSize: "clamp(4.5rem, 16vw, 9rem)", lineHeight: 0.9 }}
      >
        404
      </p>
      <div className="mt-6 max-w-md rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white px-8 py-7 shadow-[6px_6px_0_0_var(--brand-charcoal)]">
        <h1 className="font-display text-3xl">Page not found</h1>
        <p className="mt-3 text-ink-muted">
          That page is not here. It may have moved, or the link is out of date.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button href="/shop">Back to shop</Button>
          <Button href="/" variant="ghost">
            Home
          </Button>
        </div>
      </div>
    </Container>
  );
}
