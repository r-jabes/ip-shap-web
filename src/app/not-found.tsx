import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-xs tracking-[0.16em] text-brand-burnt-orange uppercase">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl">Page not found</h1>
      <p className="mt-3 text-brand-dark-neutral">
        That route is not part of the IP SHAP prototype.
      </p>
      <Button href="/shop" className="mt-8">
        Back to shop
      </Button>
    </Container>
  );
}
