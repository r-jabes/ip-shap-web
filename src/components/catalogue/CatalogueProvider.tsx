"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Category } from "@/domain/catalogue";

type CatalogueContextValue = {
  categories: Category[];
  categoryName: (slug: string | undefined) => string | undefined;
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

/**
 * Category names for client components (cards, quick view). Only the small category list is sent
 * to the browser; products are loaded per page, never as a whole catalogue.
 */
export function CatalogueProvider({
  categories,
  children,
}: {
  categories: Category[];
  children: ReactNode;
}) {
  const categoryName = useCallback(
    (slug: string | undefined) =>
      slug
        ? categories.find((category) => category.slug === slug)?.name
        : undefined,
    [categories],
  );

  const value = useMemo(
    () => ({ categories, categoryName }),
    [categories, categoryName],
  );

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
}

/** Optional — ProductCard may render outside the provider in tests. */
export function useCatalogueOptional(): CatalogueContextValue | null {
  return useContext(CatalogueContext);
}
