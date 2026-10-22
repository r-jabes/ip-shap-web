"use client";

import { useMemo, useState } from "react";
import { saveProductAction, archiveProductAction } from "@/app/admin/actions";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import type { DemoProduct } from "@/domain/catalogue";
import { formatRwf } from "@/lib/money";

export function ProductForm({
  product,
  categories,
  canEditPrice = true,
}: {
  product?: DemoProduct;
  categories: Array<{ slug: string; name: string }>;
  /** Staff cannot change prices (enforced again in the server action). */
  canEditPrice?: boolean;
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
      <AdminPanel className="max-w-3xl">
        <form
          action={saveProductAction}
          className="grid gap-4"
          onChange={() => setDirty(true)}
          onSubmit={() => setDirty(false)}
        >
          {product ? <input type="hidden" name="id" value={product.id} /> : null}
          <Field id="product-name" label="Name">
            <Input
              id="product-name"
              name="name"
              required
              defaultValue={product?.name}
            />
          </Field>
          <Field id="product-slug" label="Slug">
            <Input
              id="product-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              defaultValue={product?.slug}
              className="font-mono text-sm"
            />
          </Field>
          <Field id="product-description" label="Description">
            <Textarea
              id="product-description"
              name="description"
              rows={4}
              defaultValue={product?.description}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <Field
              id="product-price"
              label="Price (RWF)"
              hint={
                canEditPrice
                  ? undefined
                  : "Only owners and managers can change prices."
              }
            >
              <Input
                id="product-price"
                name="priceAmount"
                required
                inputMode="numeric"
                value={price}
                readOnly={!canEditPrice}
                onChange={(event) => {
                  if (!canEditPrice) return;
                  setPrice(event.target.value);
                }}
              />
            </Field>
            <p className="pb-3 text-sm text-ink-muted">
              Preview:{" "}
              <span className="font-semibold text-brand-burnt-orange tabular">
                {preview}
              </span>
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="product-brand-slug" label="Brand slug">
              <Input
                id="product-brand-slug"
                name="brandSlug"
                required
                defaultValue={product?.brandSlug}
              />
            </Field>
            <Field id="product-brand-name" label="Brand name">
              <Input
                id="product-brand-name"
                name="brandName"
                required
                defaultValue={product?.brandName}
              />
            </Field>
          </div>
          <Field id="product-category" label="Category">
            <Select
              id="product-category"
              name="categorySlug"
              defaultValue={product?.categorySlug ?? ""}
            >
              <option value="">None</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="product-status" label="Status">
              <Select
                id="product-status"
                name="status"
                defaultValue={product?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="demo">Demo</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </Select>
            </Field>
            <Field id="product-availability" label="Availability">
              <Select
                id="product-availability"
                name="availability"
                defaultValue={product?.availability ?? "unknown"}
              >
                <option value="unknown">Unknown</option>
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
              </Select>
            </Field>
          </div>
          <Field
            id="product-stock"
            label="Stock quantity"
            hint="Leave empty when quantity is unknown."
          >
            <Input
              id="product-stock"
              name="stockQuantity"
              inputMode="numeric"
              defaultValue={
                product?.stockQuantity === null ||
                product?.stockQuantity === undefined
                  ? ""
                  : String(product.stockQuantity)
              }
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="product-sku" label="SKU (optional)">
              <Input id="product-sku" name="sku" defaultValue={product?.sku} />
            </Field>
            <Field id="product-barcode" label="Barcode (optional)">
              <Input
                id="product-barcode"
                name="barcode"
                defaultValue={product?.barcode}
              />
            </Field>
          </div>
          <Checkbox
            name="isProvisional"
            label="Provisional / needs confirmation"
            defaultChecked={product?.isProvisional ?? true}
          />
          <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
            <Checkbox
              name="isFeatured"
              label="Featured on home"
              defaultChecked={product?.isFeatured ?? false}
            />
            <Field
              id="product-featured-sort"
              label="Featured sort"
              hint="Lower sorts first among featured products."
            >
              <Input
                id="product-featured-sort"
                name="featuredSort"
                inputMode="numeric"
                defaultValue={String(product?.featuredSort ?? 0)}
              />
            </Field>
          </div>
          {dirty ? (
            <p className="text-sm text-brand-burnt-orange" role="status">
              Unsaved changes
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="md" className="w-fit">
            Save product
          </Button>
        </form>
      </AdminPanel>

      {product ? (
        <AdminPanel className="max-w-3xl">
          <form action={archiveProductAction} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />
            <h2 className="font-display text-xl">Archive product</h2>
            <p className="text-sm text-ink-muted">
              Prefer archive over delete when orders may reference this SKU.
              Type <strong className="text-brand-charcoal">ARCHIVE</strong> to
              confirm.
            </p>
            <Field id="archive-confirm" label="Confirmation">
              <Input
                id="archive-confirm"
                name="confirm"
                value={confirmArchive}
                onChange={(event) => setConfirmArchive(event.target.value)}
                autoComplete="off"
              />
            </Field>
            <Button
              type="submit"
              variant="ghost"
              size="md"
              disabled={confirmArchive !== "ARCHIVE"}
            >
              Archive
            </Button>
          </form>
        </AdminPanel>
      ) : null}
    </div>
  );
}
