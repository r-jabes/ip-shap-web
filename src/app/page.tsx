import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { SHORT_BRAND } from "@/lib/brand";
import { getCategories, getFeaturedProducts } from "@/lib/catalogue";

export default function HomePage() {
  const featured = getFeaturedProducts(4);
  const categories = getCategories();

  return (
    <>
      <section className="relative isolate min-h-[92vh] overflow-hidden bg-brand-charcoal text-brand-warm-white">
        <Image
          src="/products/drink-60000.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-45"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-brand-charcoal via-brand-charcoal/85 to-brand-charcoal/40"
        />
        <Container className="relative flex min-h-[92vh] flex-col justify-end py-16 lg:py-24">
          <div className="hero-enter max-w-2xl">
            <p className="text-xs tracking-[0.2em] text-brand-burnt-orange uppercase">
              {SHORT_BRAND} · Rwanda
            </p>
            <h1
              className="mt-4 font-display leading-[1.05] text-balance"
              style={{ fontSize: "var(--type-display)" }}
            >
              {SHORT_BRAND}
            </h1>
            <p className="mt-5 max-w-md text-base text-brand-warm-white/85 sm:text-lg">
              Drinks, curated with quiet confidence. Provisional catalogue from
              client photography — prices and product details await confirmation
              from THE IP SHAP BUSINESS LTD.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/shop" variant="on-dark">
                Shop drinks
              </Button>
              <Button
                href="/about"
                variant="ghost"
                className="border-brand-warm-white/30 text-brand-warm-white"
              >
                About the brand
              </Button>
            </div>
            <p className="mt-6 text-xs text-brand-warm-white/55">
              Hero uses a client product photograph. Catalogue prices are
              provisional.
            </p>
          </div>
        </Container>
      </section>

      <section className="border-b border-brand-dark-neutral/15 py-14">
        <Container>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2
                className="font-display text-brand-charcoal"
                style={{ fontSize: "var(--type-h2)" }}
              >
                Collections
              </h2>
              <p className="mt-2 max-w-lg text-brand-dark-neutral">
                Provisional groupings for browsing. Confirm taxonomy with Rosine
                before launch.
              </p>
            </div>
            <DemoBadge>Provisional</DemoBadge>
          </div>
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="block border-t border-brand-charcoal pt-4 transition-colors duration-200 hover:border-brand-burnt-orange"
                >
                  <h3 className="font-display text-2xl">{category.name}</h3>
                  <p className="mt-2 text-sm text-brand-dark-neutral">
                    {category.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2
                className="font-display"
                style={{ fontSize: "var(--type-h2)" }}
              >
                From the shelf
              </h2>
              <p className="mt-2 max-w-xl text-brand-dark-neutral">
                Client-supplied photographs with provisional prices. Names
                marked unverified until confirmed.
              </p>
            </div>
            <Button href="/shop" variant="secondary">
              View all
            </Button>
          </div>
          <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
            {featured.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="bg-brand-charcoal py-16 text-brand-warm-white">
        <Container className="grid gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
              Order with clarity
            </h2>
            <p className="mt-4 text-brand-warm-white/75">
              Online payment and WhatsApp-assisted ordering are planned.
              Delivery zones, fees and timelines stay unavailable until the
              business confirms them.
            </p>
          </div>
          <ul className="space-y-4 text-sm">
            <li className="border-l-2 border-brand-burnt-orange pl-4">
              Provisional prices from photo filenames — confirm before launch
            </li>
            <li className="border-l-2 border-brand-warm-white/30 pl-4">
              Multi-bottle photos flagged until individual SKU shots arrive
            </li>
            <li className="border-l-2 border-brand-warm-white/30 pl-4">
              Contact and WhatsApp numbers are placeholders
            </li>
          </ul>
        </Container>
      </section>

      <section className="py-16">
        <Container className="grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-end">
          <div>
            <h2 className="font-display" style={{ fontSize: "var(--type-h2)" }}>
              About {SHORT_BRAND}
            </h2>
            <p className="mt-4 max-w-xl text-brand-dark-neutral">
              THE IP SHAP BUSINESS LTD is building a focused drinks retail
              experience for Rwanda. This storefront currently uses provisional
              catalogue data pending owner confirmation.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button href="/contact">Contact</Button>
            <Button href="/delivery" variant="ghost">
              Delivery info
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
