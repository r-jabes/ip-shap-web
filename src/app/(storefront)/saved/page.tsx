import type { Metadata } from "next";
import { SavedProducts } from "@/components/saved/SavedProducts";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Saved drinks",
  robots: { index: false, follow: true },
};

export default function SavedPage() {
  return (
    <Container className="py-10 lg:py-14">
      <p className="text-xs font-semibold tracking-[0.14em] text-ink-muted uppercase">
        Your list
      </p>
      <h1
        className="font-display mt-2 text-brand-charcoal"
        style={{ fontSize: "var(--type-display)" }}
      >
        Saved drinks
      </h1>
      <p className="mt-3 max-w-xl text-ink-muted">
        Drinks you saved on this device. Prices and availability are always
        up to date.
      </p>
      <div className="mt-8">
        <SavedProducts />
      </div>
    </Container>
  );
}
