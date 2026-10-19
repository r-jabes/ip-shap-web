"use client";

import { useMemo, useState } from "react";
import { saveProductAction, archiveProductAction } from "@/app/admin/actions";
import type { DemoProduct } from "@/domain/catalogue";
import { formatRwf } from "@/lib/money";

export function ProductForm({
  product,
  categories,
}: {
  product?: DemoProduct;
  categories: Array<{ slug: string; name: string }>;
}) {
  const [price, setPrice] = useState(String(product?.price.amount ?? ""));
  const [dirty, setDirty] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState("");
  const preview = useMemo(() => {
    const amount = Number.parseInt(price, 10);
    if (!Number.isInteger(amount) || amount < 0) return "—";
    return formatRwf(amount);
  }, [price]);

  return (
    <div className="space-y-8">
      <form
        action={saveProductAction}
        className="grid max-w-3xl gap-4"
        onChange={() => setDirty(true)}
        onSubmit={() => setDirty(false)}
      >
        {product ? <input type="hidden" name="id" value={product.id} /> : null}
        <label className="grid gap-1 text-sm">
          Name
          <input
            name="name"
            required
            defaultValue={product?.name}
            className="border border-brand-dark-neutral/30 px-3 py-2"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Slug
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            defaultValue={product?.slug}
            className="border border-brand-dark-neutral/30 px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Description
          <textarea
            name="description"
            rows={4}
            defaultValue={product?.description}
            className="border border-brand-dark-neutral/30 px-3 py-2"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Price (integer RWF)
            <input
              name="priceAmount"
              required
              inputMode="numeric"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <p className="self-end text-sm text-brand-dark-neutral">
            Preview:{" "}
            <span className="font-medium text-brand-charcoal">{preview}</span>
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Brand slug
            <input
              name="brandSlug"
              required
              defaultValue={product?.brandSlug}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Brand name
            <input
              name="brandName"
              required
              defaultValue={product?.brandName}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Category
          <select
            name="categorySlug"
            defaultValue={product?.categorySlug ?? ""}
            className="border border-brand-dark-neutral/30 px-3 py-2"
          >
            <option value="">None</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Status
            <select
              name="status"
              defaultValue={product?.status ?? "draft"}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            >
              <option value="draft">Draft</option>
              <option value="demo">Demo</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            Availability
            <select
              name="availability"
              defaultValue={product?.availability ?? "unknown"}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            >
              <option value="unknown">Unknown</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </label>
        </div>
        <label className="grid gap-1 text-sm">
          Stock quantity (empty = unknown)
          <input
            name="stockQuantity"
            inputMode="numeric"
            defaultValue={
              product?.stockQuantity === null ||
              product?.stockQuantity === undefined
                ? ""
                : String(product.stockQuantity)
            }
            className="border border-brand-dark-neutral/30 px-3 py-2"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            SKU (optional)
            <input
              name="sku"
              defaultValue={product?.sku}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Barcode (optional)
            <input
              name="barcode"
              defaultValue={product?.barcode}
              className="border border-brand-dark-neutral/30 px-3 py-2"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isProvisional"
            defaultChecked={product?.isProvisional ?? true}
          />
          Provisional / needs confirmation
        </label>
        {dirty ? (
          <p className="text-sm text-brand-burnt-orange" role="status">
            Unsaved changes
          </p>
        ) : null}
        <button
          type="submit"
          className="w-fit bg-brand-charcoal px-4 py-2 text-sm text-brand-warm-white"
        >
          Save product
        </button>
      </form>

      {product ? (
        <form
          action={archiveProductAction}
          className="max-w-3xl border border-brand-dark-neutral/20 p-4"
        >
          <input type="hidden" name="id" value={product.id} />
          <h2 className="font-display text-xl">Archive product</h2>
          <p className="mt-2 text-sm text-brand-dark-neutral">
            Prefer archive over delete when orders may reference this SKU. Type{" "}
            <strong>ARCHIVE</strong> to confirm.
          </p>
          <input
            name="confirm"
            value={confirmArchive}
            onChange={(event) => setConfirmArchive(event.target.value)}
            className="mt-3 w-full border border-brand-dark-neutral/30 px-3 py-2"
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={confirmArchive !== "ARCHIVE"}
            className="mt-3 border border-brand-charcoal px-4 py-2 text-sm disabled:opacity-40"
          >
            Archive
          </button>
        </form>
      ) : null}
    </div>
  );
}
