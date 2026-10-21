import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { CatalogueProvider } from "@/components/catalogue/CatalogueProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ChromeOverlays } from "@/components/layout/ChromeOverlays";
import { ChromeProvider } from "@/components/layout/ChromeProvider";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { PreviewIndicator } from "@/components/layout/PreviewIndicator";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageEnter } from "@/components/motion/PageEnter";
import { SkipLink } from "@/components/SkipLink";
import {
  getCachedBrands,
  getCachedCategories,
  getCachedPublishedProducts,
} from "@/lib/catalogue/cache";
import { buildNavDataFrom } from "@/lib/navigation";

export async function SiteShell({ children }: { children: React.ReactNode }) {
  const [products, categories, brands] = await Promise.all([
    getCachedPublishedProducts(),
    getCachedCategories(),
    getCachedBrands(),
  ]);
  const nav = buildNavDataFrom(products, categories);

  return (
    <CatalogueProvider
      products={products}
      categories={categories}
      brands={brands}
    >
      <CartProvider>
        <ChromeProvider>
          <div className="flex min-h-dvh flex-col bg-brand-warm-white pb-[var(--bottom-bar-h)] text-brand-charcoal lg:pb-0">
            <SkipLink />
            <AnnouncementBar />
            <SiteHeader nav={nav} />
            <main id="main-content" className="flex-1">
              <PageEnter>{children}</PageEnter>
            </main>
            <SiteFooter nav={nav} />
          </div>
          <CartDrawer />
          <ChromeOverlays nav={nav} />
          <MobileBottomBar />
          <PreviewIndicator />
        </ChromeProvider>
      </CartProvider>
    </CatalogueProvider>
  );
}
