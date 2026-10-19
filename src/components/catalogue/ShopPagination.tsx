import Link from "next/link";

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
      className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-brand-dark-neutral/15 pt-6 text-sm"
      aria-label="Catalogue pages"
    >
      {prev ? (
        <Link
          href={buildHref(prev)}
          className="underline-offset-4 hover:underline"
          rel="prev"
        >
          Previous
        </Link>
      ) : (
        <span className="text-brand-dark-neutral/50">Previous</span>
      )}
      <p className="text-brand-dark-neutral">
        Page <span className="font-medium text-brand-charcoal">{page}</span> of{" "}
        {totalPages}
      </p>
      {next ? (
        <Link
          href={buildHref(next)}
          className="underline-offset-4 hover:underline"
          rel="next"
        >
          Next
        </Link>
      ) : (
        <span className="text-brand-dark-neutral/50">Next</span>
      )}
    </nav>
  );
}
