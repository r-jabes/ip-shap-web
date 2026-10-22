import Link from "next/link";
import type { AdminPageResult } from "@/lib/admin/pagination";
import { buildAdminPageHref } from "@/lib/admin/pagination";

export function AdminPagination({
  pathname,
  searchParams,
  result,
  label = "rows",
}: {
  pathname: string;
  /** Current query keys to preserve (excluding page, which is controlled). */
  searchParams: Record<string, string | undefined>;
  result: Pick<
    AdminPageResult<unknown>,
    "page" | "total" | "totalPages" | "from" | "to"
  >;
  label?: string;
}) {
  if (result.total === 0) return null;

  const prevHref =
    result.page > 1
      ? buildAdminPageHref(pathname, searchParams, result.page - 1)
      : null;
  const nextHref =
    result.page < result.totalPages
      ? buildAdminPageHref(pathname, searchParams, result.page + 1)
      : null;

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-ink-muted">
        Showing{" "}
        <span className="font-semibold tabular text-brand-charcoal">
          {result.from}–{result.to}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular text-brand-charcoal">
          {result.total}
        </span>{" "}
        {label}
        {result.totalPages > 1 ? (
          <>
            {" "}
            · page{" "}
            <span className="font-semibold tabular text-brand-charcoal">
              {result.page}
            </span>{" "}
            of{" "}
            <span className="font-semibold tabular text-brand-charcoal">
              {result.totalPages}
            </span>
          </>
        ) : null}
      </p>
      {result.totalPages > 1 ? (
        <div className="flex flex-wrap gap-2">
          {prevHref ? (
            <Link
              href={prevHref}
              className="inline-flex h-10 items-center rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-4 text-sm font-semibold shadow-[3px_3px_0_0_var(--brand-charcoal)]"
              rel="prev"
            >
              Previous
            </Link>
          ) : (
            <span
              className="inline-flex h-10 items-center rounded-full border-2 border-brand-charcoal/20 px-4 text-sm font-semibold text-ink-muted"
              aria-disabled="true"
            >
              Previous
            </span>
          )}
          {nextHref ? (
            <Link
              href={nextHref}
              className="inline-flex h-10 items-center rounded-full border-2 border-brand-charcoal bg-brand-charcoal px-4 text-sm font-semibold text-brand-warm-white shadow-[3px_3px_0_0_var(--brand-burnt-orange)]"
              rel="next"
            >
              Next
            </Link>
          ) : (
            <span
              className="inline-flex h-10 items-center rounded-full border-2 border-brand-charcoal/20 px-4 text-sm font-semibold text-ink-muted"
              aria-disabled="true"
            >
              Next
            </span>
          )}
        </div>
      ) : null}
    </nav>
  );
}
