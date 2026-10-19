"use client";

import { MobileMenu } from "@/components/layout/MobileMenu";
import { SearchOverlay } from "@/components/layout/SearchOverlay";
import { useChrome } from "@/components/layout/ChromeProvider";
import type { NavData } from "@/lib/navigation";

/** Mounts the shared overlays once for the whole storefront shell. */
export function ChromeOverlays({ nav }: { nav: NavData }) {
  const { searchOpen, closeSearch } = useChrome();
  return (
    <>
      <SearchOverlay
        open={searchOpen}
        onClose={closeSearch}
        groups={nav.groups}
      />
      <MobileMenu groups={nav.groups} />
    </>
  );
}
