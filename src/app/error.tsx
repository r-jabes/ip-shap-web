"use client";

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container className="flex min-h-[70dvh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold tracking-[0.18em] text-brand-burnt-orange uppercase">
        Something spilled
      </p>
      <div className="mt-6 max-w-md rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white px-8 py-7 shadow-[6px_6px_0_0_var(--brand-charcoal)]">
        <h1 className="font-display text-3xl">Something went wrong</h1>
        <p className="mt-3 text-ink-muted">
          We hit an unexpected problem. Try again, or head home and continue
          browsing.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button href="/" variant="ghost">
            Home
          </Button>
        </div>
      </div>
    </Container>
  );
}
