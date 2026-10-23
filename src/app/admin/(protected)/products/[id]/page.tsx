import { notFound } from "next/navigation";
import { archiveProductAction } from "@/app/admin/actions";
import {
  AdminPageHeader,
  AdminPanel,
  AdminPill,
} from "@/components/admin/admin-ui";
import {
  AdminStatusBadge,
  formatAvailabilityLabel,
  formatStockSummary,
} from "@/components/admin/AdminStatusBadge";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";
import { DiscountModal, ProductModal } from "@/components/admin/ProductForm";
import { ProductImageUpload } from "@/components/admin/ProductImageUpload";
import { ProductImageFrame } from "@/components/media/ProductImageFrame";
import { Button } from "@/components/ui/Button";
import { formatDemoPrice } from "@/domain/catalogue";
import {
  adminGetProductDurable,
  adminListBrandsDurable,
  adminListCategoriesDurable,
} from "@/lib/admin/catalogue-durable";
import { impliedDiscountPercent } from "@/lib/admin/discount";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";
import { primaryCatalogueImage } from "@/lib/product-image";

type Params = Promise<{ id: string }>;

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold tracking-[0.12em] text-ink-muted uppercase">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default async function AdminProductPage({ params }: { params: Params }) {
  const { id } = await params;

  const product = await adminGetProductDurable(id);
  if (!product) notFound();

  const [session, categories, brands] = await Promise.all([
    getAdminSession(),
    adminListCategoriesDurable(),
    adminListBrandsDurable(),
  ]);
  const canEditPrice = session
    ? roleHasPermission(session.role, "products:price")
    : false;
  const image = primaryCatalogueImage(product.images);
  const percent = impliedDiscountPercent(
    product.price.amount,
    product.compareAtPrice?.amount,
  );
  const category = categories.find((row) => row.slug === product.categorySlug);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={product.name}
        description={product.brandName || undefined}
        actions={
          <Button href="/admin/products" variant="ghost" size="sm">
            Back to products
          </Button>
        }
      />

      <div className="flex flex-wrap gap-2">
        <ProductModal
          product={product}
          categories={categories.map(({ slug, name }) => ({ slug, name }))}
          brands={brands.map(({ slug, name }) => ({ slug, name }))}
          canEditPrice={canEditPrice}
          triggerLabel="Edit details"
        />
        {canEditPrice ? <DiscountModal product={product} /> : null}
        <ProductImageUpload
          productId={product.id}
          productName={product.name}
          images={product.images}
        />
        {product.status !== "archived" ? (
          <ConfirmActionModal
            triggerLabel="Archive"
            title="Archive this product?"
            description="It will be hidden from the shop and from the main products list. Past orders keep their details. You can restore it later by editing it and choosing Draft."
            confirmLabel="Archive product"
            action={archiveProductAction}
            fields={{ id: product.id }}
          />
        ) : null}
      </div>

      <AdminPanel>
        <div className="grid gap-6 sm:grid-cols-[10rem_1fr]">
          <div className="w-40 max-w-full overflow-hidden rounded-[var(--radius-frame)] border-2 border-brand-charcoal/15">
            <ProductImageFrame
              image={image}
              alt={image?.alt ?? product.name}
              emptyLabel="No image yet"
            />
          </div>
          <dl className="grid gap-5 sm:grid-cols-2">
            <Detail label="Status">
              <AdminStatusBadge status={product.status} />
            </Detail>
            <Detail label="Price">
              <span className="tabular font-semibold">
                {formatDemoPrice(product.price)}
              </span>
              {product.compareAtPrice ? (
                <>
                  {" "}
                  <span className="tabular text-ink-muted line-through">
                    {formatDemoPrice(product.compareAtPrice)}
                  </span>{" "}
                  <AdminPill tone="good">−{percent}%</AdminPill>
                </>
              ) : null}
            </Detail>
            <Detail label="Stock">
              {formatAvailabilityLabel(product.availability)} ·{" "}
              {formatStockSummary(product.availability, product.stockQuantity)}
            </Detail>
            <Detail label="Category">{category?.name ?? "No category"}</Detail>
            <Detail label="Featured">
              {product.isFeatured
                ? `Yes, position ${product.featuredSort ?? 0}`
                : "No"}
            </Detail>
            <Detail label="Needs review">
              {product.isProvisional ? "Yes" : "No"}
            </Detail>
            <Detail label="Web address">
              <span className="font-mono text-xs">/product/{product.slug}</span>
            </Detail>
            <Detail label="SKU">{product.sku || "—"}</Detail>
          </dl>
        </div>
        {product.description ? (
          <p className="mt-6 border-t border-brand-charcoal/10 pt-5 text-sm text-ink-muted">
            {product.description}
          </p>
        ) : null}
      </AdminPanel>
    </div>
  );
}
