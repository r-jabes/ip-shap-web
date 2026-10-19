"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Light route settle (opacity + slight rise). Not the View Transitions API —
 * that waits on a Next.js upgrade; this is the intentional fallback.
 */
export function PageEnter({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter">
      {children}
    </div>
  );
}
