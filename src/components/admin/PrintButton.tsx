"use client";

import { Button } from "@/components/ui/Button";

export function PrintButton({ label = "Print" }: { label?: string }) {
  return (
    <Button type="button" variant="primary" size="sm" onClick={() => window.print()}>
      {label}
    </Button>
  );
}
