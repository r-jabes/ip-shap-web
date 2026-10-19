"use client";

import { Accordion } from "@/components/ui/Accordion";

export type FaqItem = { question: string; answer: string };

export function FaqList({ items }: { items: FaqItem[] }) {
  return (
    <div className="rounded-[var(--radius-panel)] border-2 border-brand-charcoal bg-brand-warm-white px-5 shadow-[6px_6px_0_0_var(--brand-charcoal)] sm:px-7">
      {items.map((item, index) => (
        <Accordion
          key={item.question}
          title={item.question}
          defaultOpen={index === 0}
          className={index === 0 ? "!border-t-0" : undefined}
        >
          <p className="max-w-2xl text-sm sm:text-base">{item.answer}</p>
        </Accordion>
      ))}
    </div>
  );
}
