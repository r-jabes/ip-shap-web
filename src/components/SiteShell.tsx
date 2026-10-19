import { CartDrawer } from "@/components/cart/CartDrawer";
import { CartProvider } from "@/components/cart/CartProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { ChromeOverlays } from "@/components/layout/ChromeOverlays";
import { ChromeProvider } from "@/components/layout/ChromeProvider";
import { MobileBottomBar } from "@/components/layout/MobileBottomBar";
import { PreviewIndicator } from "@/components/layout/PreviewIndicator";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { PageEnter } from "@/components/motion/PageEnter";
import { SkipLink } from "@/components/SkipLink";
import { buildNavData } from "@/lib/navigation";

export function SiteShell({ children }: { children: React.ReactNode }) {
  const nav = buildNavData();

  return (
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
  );
}
