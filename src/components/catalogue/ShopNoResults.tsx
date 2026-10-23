import Link from "next/link";
import { Button } from "@/components/ui/Button";

type Props = {
  /** What the customer typed, if anything. */
  searchText?: string;
  /** Categories to suggest instead (already sorted by the caller). */
  suggestions: { slug: string; name: string }[];
  hasFilters: boolean;
};

/** Friendly dead-end page: say what happened, give a way out, and offer other places to look. */
export function ShopNoResults({ searchText, suggestions, hasFilters }: Props) {
  return (
    <div className="rounded-[var(--radius-panel)] border-2 border-dashed border-brand-charcoal/30 px-6 py-14 text-center">
      <p className="text-xs font-semibold tracking-[0.16em] text-ink-muted uppercase">
        No matches
      </p>
      <h2 className="font-display mt-2 text-2xl">
        {searchText
          ? `We couldn’t find “${searchText}”`
          : "No drinks match these filters"}
      </h2>
      <ul className="mx-auto mt-3 max-w-md list-disc space-y-1 pl-5 text-left text-sm text-ink-muted">
        <li>Check the spelling, or try a shorter word like the brand name.</li>
        {hasFilters ? (
          <li>Remove a filter, such as price or availability.</li>
        ) : null}
        <li>Not on the list? Ask us — we can often source it.</li>
      </ul>

      {suggestions.length > 0 ? (
        <div className="mt-6">
          <p className="text-sm font-semibold text-brand-charcoal">
            Or browse a range
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {suggestions.map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="rounded-full border-2 border-brand-charcoal px-4 py-2 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-charcoal hover:text-brand-warm-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button href="/shop" variant="primary" size="md">
          Show all drinks
        </Button>
        <Button href="/contact" variant="ghost" size="md">
          Ask us for a drink
        </Button>
      </div>
    </div>
  );
}
