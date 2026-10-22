import Link from "next/link";
import type { AdminPageResult } from "@/lib/admin/pagination";
import { buildAdminPageHref } from "@/lib/admin/pagination";

const buttonBase =
  "inline-flex h-10 items-center justify-center rounded-full border-2 px-5 text-sm font-semibold";
const disabledButton = `${buttonBase} border-brand-charcoal/20 text-ink-muted`;

/** Showing X–Y of Z with Previous / Next. Both buttons always render; unavailable ones are disabled. */
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
        {label} · page{" "}
        <span className="font-semibold tabular text-brand-charcoal">
          {result.page}
        </span>{" "}
        of{" "}
        <span className="font-semibold tabular text-brand-charcoal">
          {result.totalPages}
        </span>
      </p>
      <div className="grid grid-cols-2 gap-2 sm:flex">
        {prevHref ? (
          <Link
            href={prevHref}
            rel="prev"
            className={`${buttonBase} border-brand-charcoal bg-brand-warm-white shadow-[3px_3px_0_0_var(--brand-charcoal)]`}
          >
            Previous
          </Link>
        ) : (
          <span className={disabledButton} aria-disabled="true">
            Previous
          </span>
        )}
        {nextHref ? (
          <Link
            href={nextHref}
            rel="next"
            className={`${buttonBase} border-brand-charcoal bg-brand-charcoal text-brand-warm-white shadow-[3px_3px_0_0_var(--brand-burnt-orange)]`}
          >
            Next
          </Link>
        ) : (
          <span className={disabledButton} aria-disabled="true">
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
