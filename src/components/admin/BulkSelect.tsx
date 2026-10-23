"use client";

import { useEffect, useState, useTransition } from "react";
import { bulkProductsAction } from "@/app/admin/actions";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Button } from "@/components/ui/Button";

const SELECTOR = "input[data-bulk-id]";
const CHANGE_EVENT = "admin-bulk-selection";

function checkboxes(): HTMLInputElement[] {
  return Array.from(document.querySelectorAll<HTMLInputElement>(SELECTOR));
}

/** Header checkbox that ticks or clears every row on the page. */
export function BulkSelectAll() {
  return (
    <input
      type="checkbox"
      aria-label="Select all products on this page"
      className="size-4 accent-brand-charcoal"
      onChange={(event) => {
        for (const box of checkboxes()) box.checked = event.target.checked;
        window.dispatchEvent(new Event(CHANGE_EVENT));
      }}
    />
  );
}

/** Row checkbox. The bar below reads the ticked ones. */
export function BulkRowCheckbox({ id, name }: { id: string; name: string }) {
  return (
    <input
      type="checkbox"
      data-bulk-id={id}
      aria-label={`Select ${name}`}
      className="size-4 accent-brand-charcoal"
      onChange={() => window.dispatchEvent(new Event(CHANGE_EVENT))}
    />
  );
}

/** Appears once something is ticked: publish, move to drafts, or archive the selection. */
export function BulkActionBar() {
  const toast = useAdminToast();
  const [count, setCount] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const update = () =>
      setCount(checkboxes().filter((box) => box.checked).length);
    window.addEventListener(CHANGE_EVENT, update);
    return () => window.removeEventListener(CHANGE_EVENT, update);
  }, []);

  if (count === 0) return null;

  function run(intent: "publish" | "draft" | "archive") {
    const ids = checkboxes()
      .filter((box) => box.checked)
      .map((box) => box.dataset.bulkId!);
    const formData = new FormData();
    formData.set("intent", intent);
    for (const id of ids) formData.append("ids", id);

    startTransition(async () => {
      const result = await bulkProductsAction(formData);
      if (result.ok) {
        toast.success(result.message ?? "Done.");
        for (const box of checkboxes()) box.checked = false;
        setCount(0);
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div
      role="region"
      aria-label="Actions for selected products"
      className="sticky bottom-4 z-20 flex flex-wrap items-center gap-2 rounded-full border-2 border-brand-charcoal bg-brand-warm-white px-4 py-2 shadow-[4px_4px_0_0_var(--brand-charcoal)]"
    >
      <p className="mr-2 text-sm font-semibold" aria-live="polite">
        {count} selected
      </p>
      <Button type="button" size="sm" variant="primary" disabled={pending} onClick={() => run("publish")}>
        Publish
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => run("draft")}>
        Move to drafts
      </Button>
      <Button type="button" size="sm" variant="ghost" disabled={pending} onClick={() => run("archive")}>
        Archive
      </Button>
    </div>
  );
}
