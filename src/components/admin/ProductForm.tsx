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
          className="grid gap-6"
          onChange={() => setDirty(true)}
          onSubmit={() => setDirty(false)}
        >
          {product ? <input type="hidden" name="id" value={product.id} /> : null}

          <section className="grid gap-4">
            <h2 className="font-display text-xl">Basics</h2>
            <Field
              id="product-name"
              label="Name"
              hint="Title shoppers see on the product page and in search."
            >
              <Input
                id="product-name"
                name="name"
                required
                defaultValue={product?.name}
                placeholder="House Red"
              />
            </Field>
            <Field
              id="product-slug"
              label="Slug"
              hint="URL-safe id for links. Lowercase letters, numbers, and hyphens only — for example house-red."
            >
              <Input
                id="product-slug"
                name="slug"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                defaultValue={product?.slug}
                className="font-mono text-sm"
                placeholder="house-red"
              />
            </Field>
            <Field
              id="product-description"
              label="Description"
              hint="Shown on the product page. Keep it clear and customer-facing."
            >
              <Textarea
                id="product-description"
                name="description"
                rows={4}
                defaultValue={product?.description}
                placeholder="Smooth everyday red for the table."
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="product-brand-slug"
                label="Brand slug"
                hint="Matches the brand record used in filters."
              >
                <Input
                  id="product-brand-slug"
                  name="brandSlug"
                  required
                  defaultValue={product?.brandSlug}
                  placeholder="ip-shap-house"
                  className="font-mono text-sm"
                />
              </Field>
              <Field
                id="product-brand-name"
                label="Brand name"
                hint="Display name on product cards."
              >
                <Input
                  id="product-brand-name"
                  name="brandName"
                  required
                  defaultValue={product?.brandName}
                  placeholder="IP SHAP"
                />
              </Field>
            </div>
            <Field
              id="product-category"
              label="Category"
              hint="Controls shop filters and menu grouping."
            >
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
          </section>

          <section className="grid gap-4 border-t border-brand-charcoal/10 pt-6">
            <h2 className="font-display text-xl">Pricing & stock</h2>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <Field
                id="product-price"
                label="Price (RWF)"
                hint={
                  canEditPrice
                    ? "Whole francs only — no decimals or commas."
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
                  placeholder="15000"
                  onChange={(event) => {
                    if (!canEditPrice) return;
                    setPrice(event.target.value);
                  }}
                />
              </Field>
              <p className="sm:pt-8 text-sm text-ink-muted">
                Preview:{" "}
                <span className="font-semibold text-brand-burnt-orange tabular">
                  {preview}
                </span>
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="product-availability"
                label="Availability"
                hint="How this product appears for purchase. Use Unknown when you are unsure."
              >
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
              <Field
                id="product-stock"
                label="Stock quantity"
                hint="Leave empty when the count is unknown. Prefer Stock adjustments for audited changes."
              >
                <Input
                  id="product-stock"
                  name="stockQuantity"
                  inputMode="numeric"
                  placeholder="24"
                  defaultValue={
                    product?.stockQuantity === null ||
                    product?.stockQuantity === undefined
                      ? ""
                      : String(product.stockQuantity)
                  }
                />
              </Field>
            </div>
          </section>

          <section className="grid gap-4 border-t border-brand-charcoal/10 pt-6">
            <h2 className="font-display text-xl">Visibility</h2>
            <Field
              id="product-status"
              label="Status"
              hint="Draft stays off the storefront. Published is live. Archived hides it without deleting history."
            >
              <Select
                id="product-status"
                name="status"
                defaultValue={product?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
                <option value="demo">Demo</option>
              </Select>
            </Field>
            <div className="space-y-2">
              <Checkbox
                name="isProvisional"
                label="Provisional"
                defaultChecked={product?.isProvisional ?? false}
              />
              <p className="pl-8 text-sm text-ink-muted">
                Mark when price, stock, or details still need confirmation before
                treating them as final.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
              <div className="space-y-2">
                <Checkbox
                  name="isFeatured"
                  label="Featured on home"
                  defaultChecked={product?.isFeatured ?? false}
                />
                <p className="pl-8 text-sm text-ink-muted">
                  Include this product in the home featured selection.
                </p>
              </div>
              <Field
                id="product-featured-sort"
                label="Featured sort"
                hint="Among featured products, lower numbers appear first (0 before 10)."
              >
                <Input
                  id="product-featured-sort"
                  name="featuredSort"
                  inputMode="numeric"
                  defaultValue={String(product?.featuredSort ?? 0)}
                  placeholder="0"
                />
              </Field>
            </div>
          </section>

          <section className="grid gap-4 border-t border-brand-charcoal/10 pt-6">
            <h2 className="font-display text-xl">Identifiers</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="product-sku"
                label="SKU"
                hint="Your internal stock-keeping code. Optional, but helpful for warehouse and import matching."
              >
                <Input
                  id="product-sku"
                  name="sku"
                  defaultValue={product?.sku}
                  placeholder="SKU-RED-001"
                  autoComplete="off"
                />
              </Field>
              <Field
                id="product-barcode"
                label="Barcode"
                hint="Optional EAN / UPC if you scan products in person."
              >
                <Input
                  id="product-barcode"
                  name="barcode"
                  defaultValue={product?.barcode}
                  placeholder="6001234567890"
                  autoComplete="off"
                />
              </Field>
            </div>
          </section>

          {dirty ? (
            <p className="text-sm text-brand-burnt-orange" role="status">
              Unsaved changes
            </p>
          ) : null}
          <Button type="submit" variant="primary" size="md" className="w-fit">
            {product ? "Save changes" : "Create product"}
          </Button>
        </form>
      </AdminPanel>

      {product ? (
        <AdminPanel className="max-w-3xl">
          <form action={archiveProductAction} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />
            <h2 className="font-display text-xl">Archive</h2>
            <p className="text-sm text-ink-muted">
              Hides the product from the storefront. Prefer archive over delete
              when past orders may reference it. Type{" "}
              <strong className="text-brand-charcoal">ARCHIVE</strong> to
              confirm.
            </p>
            <Field id="archive-confirm" label="Confirmation">
              <Input
                id="archive-confirm"
                name="confirm"
                value={confirmArchive}
                onChange={(event) => setConfirmArchive(event.target.value)}
                autoComplete="off"
                placeholder="ARCHIVE"
              />
            </Field>
            <Button
              type="submit"
              variant="ghost"
              size="md"
              disabled={confirmArchive !== "ARCHIVE"}
            >
              Archive product
            </Button>
          </form>
        </AdminPanel>
      ) : null}
    </div>
  );
}
