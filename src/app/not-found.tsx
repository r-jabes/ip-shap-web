import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p
        className="font-display-hero text-brand-charcoal"
        style={{ fontSize: "clamp(4rem, 14vw, 9rem)" }}
      >
        404
      </p>
      <h1 className="font-display mt-4 text-3xl">Page not found</h1>
      <p className="mt-3 text-ink-muted">
        We could not find that page. It may have moved.
      </p>
      <Button href="/shop" className="mt-8">
        Back to shop
      </Button>
    </Container>
  );
}
