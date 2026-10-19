import { Button } from "@/components/ui/Button";

export function ShopPagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t-2 border-brand-charcoal/15 pt-6"
      aria-label="Catalogue pages"
    >
      {prev ? (
        <Button href={buildHref(prev)} variant="ghost" size="sm">
          Previous
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled>
          Previous
        </Button>
      )}
      <p className="text-sm text-ink-muted">
        Page{" "}
        <span className="font-semibold text-brand-charcoal tabular">
          {page}
        </span>{" "}
        of <span className="tabular">{totalPages}</span>
      </p>
      {next ? (
        <Button href={buildHref(next)} variant="ghost" size="sm">
          Next
        </Button>
      ) : (
        <Button variant="ghost" size="sm" disabled>
          Next
        </Button>
      )}
    </nav>
  );
}
