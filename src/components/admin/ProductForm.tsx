"use client";

import { useEffect, useMemo, useState } from "react";
import { saveProductAction, setDiscountAction } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdvancedSection } from "@/components/admin/AdvancedSection";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/ui/Field";
import { FilePicker } from "@/components/ui/FilePicker";
import type { DemoProduct } from "@/domain/catalogue";
import { applyDiscount, impliedDiscountPercent } from "@/lib/admin/discount";
import { formatRwf } from "@/lib/money";
import { primaryCatalogueImage } from "@/lib/product-image";

function regularPriceOf(product?: DemoProduct): number | undefined {
  if (!product) return undefined;
  return product.compareAtPrice?.amount ?? product.price.amount;
}

function discountOf(product?: DemoProduct): number {
  if (!product) return 0;
  return impliedDiscountPercent(
    product.price.amount,
    product.compareAtPrice?.amount,
  );
}

/** Live "customers pay" line for the price + discount inputs. */
function PricePreview({
  price,
  discount,
}: {
  price: string;
  discount: string;
}) {
  const text = useMemo(() => {
    const regular = Number.parseInt(price, 10);
    if (!Number.isInteger(regular) || regular < 0) return null;
    const percent = Number(discount || 0);
    if (!Number.isFinite(percent) || percent < 0 || percent > 90) return null;
    const next = applyDiscount(regular, percent);
    return next.compareAt
      ? `Customers pay ${formatRwf(next.price)} instead of ${formatRwf(next.compareAt)}.`
      : `Customers pay ${formatRwf(next.price)}.`;
  }, [price, discount]);

  return (
    <p className="text-sm text-ink-muted" aria-live="polite">
      {text ?? "Enter a whole-number price to see what customers pay."}
    </p>
  );
}

export function ProductModal({
  product,
  categories,
  brands,
  canEditPrice = true,
  defaultOpen,
  triggerLabel,
}: {
  product?: DemoProduct;
  categories: Array<{ slug: string; name: string }>;
  brands: Array<{ slug: string; name: string }>;
  /** Staff cannot change prices (enforced again in the server action). */
  canEditPrice?: boolean;
  defaultOpen?: boolean;
  triggerLabel?: string;
}) {
  const editing = !!product;
  return (
    <AdminModal
      triggerLabel={triggerLabel ?? (editing ? "Edit details" : "Add product")}
      triggerVariant={editing ? "ghost" : "primary"}
      title={editing ? "Edit product" : "Add product"}
      description={
        editing
          ? product.name
          : "Add a name, price and photo. Products without a photo stay as drafts."
      }
      width="lg"
      defaultOpen={defaultOpen}
    >
      {(close) => (
        <ProductFormBody
          product={product}
          categories={categories}
          brands={brands}
          canEditPrice={canEditPrice}
          onDone={close}
        />
      )}
    </AdminModal>
  );
}

function ProductFormBody({
  product,
  categories,
  brands,
  canEditPrice,
  onDone,
}: {
  product?: DemoProduct;
  categories: Array<{ slug: string; name: string }>;
  brands: Array<{ slug: string; name: string }>;
  canEditPrice: boolean;
  onDone: () => void;
}) {
  const [price, setPrice] = useState(String(regularPriceOf(product) ?? ""));
  const [discount, setDiscount] = useState(
    discountOf(product) ? String(discountOf(product)) : "",
  );
  const [status, setStatus] = useState(
    product?.status === "published" || product?.status === "archived"
      ? product.status
      : "draft",
  );
  const [pickedImage, setPickedImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Free the browser's copy of the previous preview when it changes or the form closes.
  useEffect(
    () => () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl],
  );
  const currentImage = primaryCatalogueImage(product?.images ?? []);
  const hasImage = !!currentImage || pickedImage;

  return (
    <ActionForm
      action={saveProductAction}
      submitLabel={product ? "Save changes" : "Add product"}
      onDone={onDone}
      onCancel={onDone}
      className="grid gap-6 text-left"
    >
      {product ? <input type="hidden" name="id" value={product.id} /> : null}

      <section className="grid gap-4">
        <h3 className="font-display text-left text-lg">Basics</h3>
        <Field
          id="product-name"
          label="Product name"
          hint="The title shoppers see on the product page and in search."
        >
          <Input
            id="product-name"
            name="name"
            required
            defaultValue={product?.name}
            placeholder="House Red"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="product-brand"
            label="Brand (optional)"
            hint="Pick an existing brand or type a new one. Leave blank if there is none."
          >
            <Input
              id="product-brand"
              name="brandName"
              list="product-brand-options"
              defaultValue={product?.brandName}
              placeholder="e.g. Johnnie Walker"
              autoComplete="off"
            />
            <datalist id="product-brand-options">
              {brands.map((brand) => (
                <option key={brand.slug} value={brand.name} />
              ))}
            </datalist>
          </Field>
          <Field
            id="product-category"
            label="Category"
            hint="Where it appears in the shop menu and filters."
          >
            <Select
              id="product-category"
              name="categorySlug"
              defaultValue={product?.categorySlug ?? ""}
            >
              <option value="">No category</option>
              {categories.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field
          id="product-description"
          label="Description (optional)"
          hint="Shown on the product page. Write it for customers."
        >
          <Textarea
            id="product-description"
            name="description"
            rows={3}
            defaultValue={product?.description}
            placeholder="Smooth everyday red for the table."
          />
        </Field>
      </section>

      <section className="grid gap-4 border-t border-brand-charcoal/10 pt-5">
        <h3 className="font-display text-left text-lg">Photo</h3>
        <p className="text-left text-sm text-ink-muted">
          A product cannot go live without a photo. Without one, it stays as a
          draft.
        </p>
        <div className="w-32 overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15">
          {previewUrl ? (
            // A local blob preview of the file the admin just picked; next/image cannot optimise it.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Selected photo preview"
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <ProductImageFrame
              image={currentImage}
              alt={currentImage?.alt ?? product?.name ?? "Product"}
              emptyLabel="No image yet"
            />
          )}
        </div>
        <Field
          id="product-image"
          label={currentImage || pickedImage ? "Replace photo" : "Add photo"}
          hint="JPEG, PNG or WebP, up to 10 MB."
        >
          <FilePicker
            id="product-image"
            name="image"
            accept="image/jpeg,image/png,image/webp"
            buttonLabel={currentImage || pickedImage ? "Choose another" : "Choose photo"}
            emptyText="No photo selected"
            describedBy="product-image-hint"
            onPick={(file) => {
              setPickedImage(!!file);
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
          />
        </Field>
        <input type="hidden" name="imageAlt" value={product?.name ?? ""} />
      </section>

      <section className="grid gap-4 border-t border-brand-charcoal/10 pt-5">
        <h3 className="font-display text-left text-lg">Price</h3>
        <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
          <Field
            id="product-price"
            label="Regular price (RWF)"
            hint={
              canEditPrice
                ? "Whole francs only, no decimals or commas."
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
              onChange={(event) => setPrice(event.target.value)}
            />
          </Field>
          <Field
            id="product-discount"
            label="Discount % (optional)"
            hint="Leave empty for no discount. The regular price is shown crossed out."
          >
            <Input
              id="product-discount"
              name="discountPercent"
              inputMode="numeric"
              value={discount}
              readOnly={!canEditPrice}
              placeholder="0"
              onChange={(event) => setDiscount(event.target.value)}
            />
          </Field>
        </div>
        <PricePreview price={price} discount={discount} />
      </section>

      <section className="grid gap-4 border-t border-brand-charcoal/10 pt-5">
        <h3 className="font-display text-left text-lg">Stock</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="product-availability"
            label="Availability"
            hint="Choose Not tracked if you are not sure yet."
          >
            <Select
              id="product-availability"
              name="availability"
              defaultValue={product?.availability ?? "unknown"}
            >
              <option value="unknown">Not tracked</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Running low</option>
              <option value="out_of_stock">Sold out</option>
            </Select>
          </Field>
          <Field
            id="product-stock"
            label="Quantity on hand"
            hint="Leave empty if you do not count this product."
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

      <section className="grid gap-4 border-t border-brand-charcoal/10 pt-5">
        <h3 className="font-display text-left text-lg">Visibility</h3>
        <Field
          id="product-status"
          label="Status"
          hint="Draft is hidden from the shop. Published is live. Archived hides it and removes it from the main list."
        >
          <Select
            id="product-status"
            name="status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value as "draft" | "published" | "archived",
              )
            }
          >
            <option value="draft">Draft (hidden)</option>
            <option value="published">Published (live)</option>
            <option value="archived">Archived</option>
          </Select>
        </Field>
        {status === "published" && !hasImage ? (
          <p
            className="rounded-2xl border border-amber-600/40 bg-amber-50 px-4 py-3 text-left text-sm text-amber-900"
            role="status"
          >
            This product has no photo yet. Saving will keep it as a draft until
            you add one.
          </p>
        ) : null}
        <div className="space-y-1">
          <Checkbox
            name="isProvisional"
            label="Needs review"
            defaultChecked={product?.isProvisional ?? false}
          />
          <p className="pl-8 text-sm text-ink-muted">
            A reminder for your team that the price, stock or description still
            needs checking. Shoppers do not see this.
          </p>
        </div>
      </section>

      <AdvancedSection hint="Web address, SKU, barcode">
        <Field
          id="product-slug"
          label="Web address name"
          hint="Used in the product link, like /product/house-red. It is created from the name. Only change it if you need a specific link: lowercase letters, numbers and hyphens."
        >
          <Input
            id="product-slug"
            name="slug"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="Lowercase letters, numbers and hyphens"
            defaultValue={product?.slug}
            className="font-mono text-sm"
            placeholder="Created from the name"
            autoComplete="off"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            id="product-sku"
            label="SKU"
            hint="Your own product code, for example RED-001. Helps you find products in a spreadsheet or stock sheet."
          >
            <Input
              id="product-sku"
              name="sku"
              defaultValue={product?.sku}
              placeholder="RED-001"
              autoComplete="off"
            />
          </Field>
          <Field
            id="product-barcode"
            label="Barcode"
            hint="The number under the barcode on the bottle, if you scan products."
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
      </AdvancedSection>
    </ActionForm>
  );
}

export function DiscountModal({ product }: { product: DemoProduct }) {
  const [discount, setDiscount] = useState(
    discountOf(product) ? String(discountOf(product)) : "",
  );
  const regular = regularPriceOf(product) ?? 0;

  return (
    <AdminModal
      triggerLabel={discountOf(product) ? "Change discount" : "Add discount"}
      triggerVariant="ghost"
      title="Discount"
      description={`${product.name} · regular price ${formatRwf(regular)}`}
      width="sm"
    >
      {(close) => (
        <ActionForm
          action={setDiscountAction}
          submitLabel="Save discount"
          onDone={close}
          onCancel={close}
        >
          <input type="hidden" name="id" value={product.id} />
          <Field
            id="discount-percent"
            label="Discount %"
            hint="Between 1 and 90. Leave empty to remove the discount."
          >
            <Input
              id="discount-percent"
              name="discountPercent"
              inputMode="numeric"
              value={discount}
              placeholder="10"
              onChange={(event) => setDiscount(event.target.value)}
            />
          </Field>
          <PricePreview price={String(regular)} discount={discount} />
        </ActionForm>
      )}
    </AdminModal>
  );
}
