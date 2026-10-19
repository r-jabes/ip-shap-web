import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCartForm } from "@/components/product/AddToCartForm";
import { ProductGallery } from "@/components/product/ProductGallery";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { formatDemoPrice } from "@/domain/catalogue";
import { getProductBySlug, listProducts } from "@/lib/catalogue";

type Params = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return listProducts().map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "Product" };
  return {
    title: product.name,
    description: product.description,
  };
}

function availabilityLabel(value: string) {
  switch (value) {
    case "in_stock":
      return "In stock (demo)";
    case "low_stock":
      return "Low stock (demo)";
    case "out_of_stock":
      return "Out of stock (demo)";
    default:
      return "Availability unknown — to confirm";
  }
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const unavailable = product.availability === "out_of_stock";

  return (
    <Container className="py-10 lg:py-14">
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery images={product.images} productName={product.name} />
        <div>
          <DemoBadge>{product.demoLabel}</DemoBadge>
          <p className="mt-4 text-xs tracking-[0.14em] text-brand-dark-neutral uppercase">
            {product.brandName}
            {product.categorySlug ? ` · ${product.categorySlug}` : ""}
          </p>
          <h1
            className="mt-2 font-display leading-tight"
            style={{ fontSize: "var(--type-h2)" }}
          >
            {product.name}
          </h1>
          <p className="mt-4 text-2xl font-medium">
            {formatDemoPrice(product.price)}
            <span className="ml-2 text-sm font-normal text-brand-dark-neutral">
              demo price — not confirmed
            </span>
          </p>
          <p className="mt-2 text-sm text-brand-dark-neutral">
            {availabilityLabel(product.availability)}
          </p>
          <p className="mt-6 max-w-prose text-brand-dark-neutral">
            {product.description}
          </p>

          <div className="mt-8">
            <AddToCartForm productId={product.id} disabled={unavailable} />
            {unavailable ? (
              <p className="mt-3 text-sm text-brand-dark-neutral">
                This demo SKU is marked out of stock for UI testing.
              </p>
            ) : null}
          </div>

          <div className="mt-10 border-t border-brand-dark-neutral/15 pt-6 text-sm text-brand-dark-neutral">
            <h2 className="font-display text-lg text-brand-charcoal">
              Details
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              <li>
                Volume, ABV and origin are not asserted in this prototype.
              </li>
              <li>
                Images are temporary placeholders, not client photography.
              </li>
              <li>
                Replace this entry with confirmed catalogue data before launch.
              </li>
            </ul>
            <Button href="/shop" variant="ghost" className="mt-6">
              Back to shop
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
