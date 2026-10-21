"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { Brand, Category, DemoProduct } from "@/domain/catalogue";

type CatalogueContextValue = {
  products: DemoProduct[];
  categories: Category[];
  brands: Brand[];
  getProductById: (id: string) => DemoProduct | undefined;
  categoryName: (slug: string | undefined) => string | undefined;
};

const CatalogueContext = createContext<CatalogueContextValue | null>(null);

/**
 * Server-hydrated published catalogue for client cart / search / cards.
 * Prices and stock are still recomputed on the server at checkout.
 */
export function CatalogueProvider({
  products,
  categories,
  brands,
  children,
}: {
  products: DemoProduct[];
  categories: Category[];
  brands: Brand[];
  children: ReactNode;
}) {
  const byId = useMemo(() => {
    const map = new Map<string, DemoProduct>();
    for (const product of products) map.set(product.id, product);
    return map;
  }, [products]);

  const getProductById = useCallback(
    (id: string) => byId.get(id),
    [byId],
  );

  const categoryName = useCallback(
    (slug: string | undefined) =>
      slug
        ? categories.find((category) => category.slug === slug)?.name
        : undefined,
    [categories],
  );

  const value = useMemo(
    () => ({
      products,
      categories,
      brands,
      getProductById,
      categoryName,
    }),
    [products, categories, brands, getProductById, categoryName],
  );

  return (
    <CatalogueContext.Provider value={value}>
      {children}
    </CatalogueContext.Provider>
  );
}

export function useCatalogue(): CatalogueContextValue {
  const ctx = useContext(CatalogueContext);
  if (!ctx) {
    throw new Error("useCatalogue must be used within CatalogueProvider");
  }
  return ctx;
}

/** Optional — ProductCard may render outside provider in tests. */
export function useCatalogueOptional(): CatalogueContextValue | null {
  return useContext(CatalogueContext);
}
