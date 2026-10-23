import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductBuyBox } from "@/components/product/ProductBuyBox";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductRelated } from "@/components/product/ProductRelated";
import { ProductStickyBar } from "@/components/product/ProductStickyBar";
import { RecentlyViewed } from "@/components/saved/RecentlyViewed";
import { RecordView } from "@/components/saved/RecordView";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { JsonLd } from "@/components/seo/JsonLd";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getProductBySlugDurable } from "@/lib/catalogue";
import { getCachedCategories } from "@/lib/catalogue/cache";
import {
  getAllProductSlugs,
  getProductSiblings,
  getRelatedForProduct,
} from "@/lib/catalogue/storefront";
import {
  breadcrumbJsonLd,
  productJsonLd,
  productMetadata,
} from "@/lib/seo";

type Params = Promise<{ slug: string }>;

export const revalidate = 3600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugDurable(slug);
  if (!product) return { title: "Product" };
  return productMetadata(product);
}

export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = await getProductBySlugDurable(slug);
  if (!product) notFound();

  const [categories, siblings, related] = await Promise.all([
    getCachedCategories(),
    getProductSiblings(product),
    getRelatedForProduct(product, 4),
  ]);
  const category = categories.find((c) => c.slug === product.categorySlug);

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    ...(category
      ? [{ name: category.name, path: `/shop?category=${category.slug}` }]
      : []),
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Container className="py-8 pb-[calc(var(--bottom-bar-h)+5.5rem)] lg:py-12 lg:pb-16">
        <Breadcrumbs
          items={[
            { name: "Home", href: "/" },
            { name: "Shop", href: "/shop" },
            ...(category
              ? [
                  {
                    name: category.name,
                    href: `/shop?category=${category.slug}`,
                  },
                ]
              : []),
            { name: product.name },
          ]}
        />

        <div className="product-purchase grid gap-8 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:gap-10 xl:gap-12">
          <div className="product-purchase__media">
            <div className="product-purchase__media-sticky">
              <ProductGallery
                images={product.images}
                productName={product.name}
              />
            </div>
          </div>
          <div className="product-purchase__info min-w-0">
            <ProductBuyBox
              product={product}
              categoryName={category?.name}
              siblings={siblings}
            />
            <div className="mt-2 border-t-2 border-brand-charcoal/15 py-5">
              <Button href="/shop" variant="ghost" size="sm">
                Back to shop
              </Button>
            </div>
          </div>
        </div>

        <ProductRelated
          products={related}
          categoryName={category?.name}
          categorySlug={category?.slug}
        />
        <RecentlyViewed currentProductId={product.id} />
      </Container>
      <RecordView productId={product.id} />
      <ProductStickyBar product={product} />
    </>
  );
}
