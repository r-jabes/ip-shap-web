"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { CartLine, DemoProduct } from "@/domain/catalogue";
import {
  CART_STORAGE_KEY,
  LEGACY_CART_KEYS,
  type CartItem,
  cartHasUnavailable,
  cartItemCount,
  cartProductCount,
  cartSubtotal,
  clampQuantity,
  parseStoredCart,
  resolveCart,
} from "@/lib/cart";
import { useCatalogueOptional } from "@/components/catalogue/CatalogueProvider";
import { getProductById as getFixtureProductById } from "@/lib/catalogue";
import { MOTION } from "@/lib/motion";
import { maxOrderableQuantity } from "@/lib/stock/storefront";

/** Live stock reported by `/api/stock`. */
type LiveStock = {
  availability: DemoProduct["availability"];
  quantity: number | null;
};

type CartContextValue = {
  /** Raw stored lines. Prefer `items` for anything rendered. */
  lines: CartLine[];
  /** Resolved lines (product data and live stock attached). Count, drawer, cart page and checkout all use this. */
  items: CartItem[];
  /** Total orderable units across resolved items. */
  itemCount: number;
  /** Distinct products in the cart (what the header badge shows). */
  productCount: number;
  /** True when at least one line is out of stock and blocks checkout. */
  hasUnavailable: boolean;
  /** Integer RWF subtotal of orderable items. */
  subtotal: number;
  /** False until localStorage has been read (avoid empty-state flashes). */
  hydrated: boolean;
  isOpen: boolean;
  /** Concise text confirmation for cart changes (also announced live). */
  feedback: string | null;
  /** Shown once when the saved cart was adjusted (removed or reduced lines). */
  notice: string | null;
  dismissNotice: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  /**
   * Re-reads current stock from the server. With no ids, refreshes every product in the cart.
   * Calls within a few seconds of each other are skipped unless `force` is set.
   */
  refreshStock: (
    ids?: string[],
    options?: { force?: boolean },
  ) => Promise<void>;
  /** Product with live stock applied (falls back to the page's own data). */
  withLiveStock: (product: DemoProduct) => DemoProduct;
};

const CartContext = createContext<CartContextValue | null>(null);

const STOCK_REFRESH_MIN_GAP_MS = 8_000;

function removalNotice(count: number): string {
  return count === 1
    ? "One item in your saved cart is no longer available and was removed."
    : `${count} items in your saved cart are no longer available and were removed.`;
}

function applyLiveStock(
  product: DemoProduct,
  live: LiveStock | undefined,
): DemoProduct {
  if (!live) return product;
  return {
    ...product,
    availability: live.availability,
    stockQuantity: live.quantity,
  };
}

function toLines(items: CartItem[]): CartLine[] {
  return items.map(({ productId, quantity }) => ({ productId, quantity }));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const catalogue = useCatalogueOptional();
  const [liveStock, setLiveStock] = useState<Record<string, LiveStock>>({});
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const baseProduct = useCallback(
    (id: string) => catalogue?.getProductById(id) ?? getFixtureProductById(id),
    [catalogue],
  );
  const resolveProduct = useCallback(
    (id: string) => {
      const product = baseProduct(id);
      return product ? applyLiveStock(product, liveStock[id]) : undefined;
    },
    [baseProduct, liveStock],
  );

  // Mutable mirrors for async callbacks and one-shot effects. The hydration and cross-tab effects
  // must not re-run when the server re-renders the layout with a fresh catalogue: re-reading
  // storage at that moment can resurrect a cart that was just cleared after an order.
  const baseProductRef = useRef(baseProduct);
  const liveStockRef = useRef(liveStock);
  const linesRef = useRef<CartLine[]>([]);
  const lastRefreshRef = useRef(new Map<string, number>());
  useEffect(() => {
    baseProductRef.current = baseProduct;
    liveStockRef.current = liveStock;
  });

  const resolveFromRefs = useCallback((id: string) => {
    const product = baseProductRef.current(id);
    return product
      ? applyLiveStock(product, liveStockRef.current[id])
      : undefined;
  }, []);

  /** Single write path so the ref, state and storage never disagree. */
  const commit = useCallback((next: CartLine[]) => {
    linesRef.current = next;
    setLines(next);
  }, []);

  // Load once, validate, discard legacy storage and prune unresolvable lines.
  useEffect(() => {
    try {
      for (const key of LEGACY_CART_KEYS) {
        window.localStorage.removeItem(key);
      }
      const stored = parseStoredCart(
        window.localStorage.getItem(CART_STORAGE_KEY),
      );
      const { items, removed } = resolveCart(stored, resolveFromRefs);
      commit(toLines(items));
      if (removed.length > 0) setNotice(removalNotice(removed.length));
    } catch {
      // Storage unavailable (private mode, quota): start with an empty cart.
    }
    setHydrated(true);
  }, [commit, resolveFromRefs]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore quota / privacy-mode errors; the cart still works for this session
    }
  }, [lines, hydrated]);

  // Keep several tabs in sync.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== CART_STORAGE_KEY) return;
      const stored = parseStoredCart(event.newValue);
      const { items } = resolveCart(stored, resolveFromRefs);
      commit(toLines(items));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [commit, resolveFromRefs]);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(
      () => setFeedback(null),
      MOTION.editorialMs * 4,
    );
    return () => window.clearTimeout(id);
  }, [feedback]);

  const refreshStock = useCallback(
    async (ids?: string[], options?: { force?: boolean }) => {
      const now = Date.now();
      const targets = [
        ...new Set(ids ?? linesRef.current.map((line) => line.productId)),
      ].filter(
        (id) =>
          options?.force ||
          now - (lastRefreshRef.current.get(id) ?? 0) >=
            STOCK_REFRESH_MIN_GAP_MS,
      );
      if (targets.length === 0) return;
      for (const id of targets) lastRefreshRef.current.set(id, now);

      let fresh: Record<string, LiveStock>;
      try {
        const response = await fetch(
          `/api/stock?ids=${targets.map(encodeURIComponent).join(",")}`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const body = (await response.json()) as {
          stock?: Record<string, LiveStock>;
        };
        if (!body.stock) return;
        fresh = body.stock;
      } catch {
        // Offline or blocked: keep showing the last known stock; checkout still re-validates.
        return;
      }

      const merged = { ...liveStockRef.current, ...fresh };
      liveStockRef.current = merged;
      setLiveStock(merged);

      // Bring saved quantities in line with reality, and say so once.
      const lowered: string[] = [];
      const soldOut: string[] = [];
      const next = linesRef.current.map((line) => {
        const base = baseProductRef.current(line.productId);
        if (!base || !fresh[line.productId]) return line;
        const max = maxOrderableQuantity(
          applyLiveStock(base, merged[line.productId]),
        );
        if (max === 0) {
          soldOut.push(base.name);
          return line;
        }
        if (line.quantity > max) {
          lowered.push(`${base.name} (${max})`);
          return { ...line, quantity: max };
        }
        return line;
      });
      if (lowered.length > 0) commit(next);
      if (soldOut.length > 0 || lowered.length > 0) {
        const parts: string[] = [];
        if (soldOut.length > 0) {
          parts.push(
            `${soldOut.join(", ")} ${soldOut.length === 1 ? "is" : "are"} now out of stock.`,
          );
        }
        if (lowered.length > 0) {
          parts.push(
            `We lowered the quantity of ${lowered.join(", ")} to what is in stock.`,
          );
        }
        setNotice(parts.join(" "));
      }
    },
    [commit],
  );

  // Check live stock once the saved cart is loaded, and again when the shopper returns to the tab.
  useEffect(() => {
    if (!hydrated) return;
    void refreshStock();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshStock();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [hydrated, refreshStock]);

  const addItem = useCallback(
    (productId: string, quantity = 1) => {
      const product = resolveProduct(productId);
      if (!product) {
        setFeedback("Sorry, that item is no longer available.");
        return;
      }
      const max = maxOrderableQuantity(product);
      if (max === 0) {
        setFeedback(`${product.name} is out of stock.`);
        return;
      }
      const current = linesRef.current;
      const inCart =
        current.find((line) => line.productId === productId)?.quantity ?? 0;
      const room = max - inCart;
      if (room <= 0) {
        setFeedback(
          `Your cart already has all ${max} of ${product.name} that we have.`,
        );
        setIsOpen(true);
        return;
      }
      const requested = clampQuantity(quantity);
      const toAdd = Math.min(requested, room);
      commit(
        inCart > 0
          ? current.map((line) =>
              line.productId === productId
                ? { ...line, quantity: clampQuantity(line.quantity + toAdd) }
                : line,
            )
          : [...current, { productId, quantity: toAdd }],
      );
      setFeedback(
        toAdd < requested
          ? `Added ${toAdd} — that is all we have of ${product.name}`
          : `Added ${product.name} to your cart`,
      );
      setIsOpen(true);
    },
    [resolveProduct, commit],
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      const current = linesRef.current;
      if (quantity <= 0) {
        commit(current.filter((line) => line.productId !== productId));
        return;
      }
      const product = resolveProduct(productId);
      const max = product ? maxOrderableQuantity(product) : Infinity;
      const requested = clampQuantity(quantity);
      const capped = max > 0 ? Math.min(requested, max) : requested;
      if (product && requested > capped) {
        setFeedback(`Only ${max} of ${product.name} in stock`);
      }
      commit(
        current.map((line) =>
          line.productId === productId ? { ...line, quantity: capped } : line,
        ),
      );
    },
    [resolveProduct, commit],
  );

  const removeItem = useCallback(
    (productId: string) => {
      commit(linesRef.current.filter((line) => line.productId !== productId));
    },
    [commit],
  );

  const clearCart = useCallback(() => {
    commit([]);
    try {
      // Write through immediately so nothing can re-read a stale cart before the effect runs.
      window.localStorage.setItem(CART_STORAGE_KEY, "[]");
    } catch {
      // ignore
    }
  }, [commit]);

  const openCart = useCallback(() => {
    setIsOpen(true);
    void refreshStock();
  }, [refreshStock]);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const withLiveStock = useCallback(
    (product: DemoProduct) => applyLiveStock(product, liveStock[product.id]),
    [liveStock],
  );

  const items = useMemo(
    () => resolveCart(lines, resolveProduct).items,
    [lines, resolveProduct],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      items,
      itemCount: cartItemCount(items),
      productCount: cartProductCount(items),
      hasUnavailable: cartHasUnavailable(items),
      subtotal: cartSubtotal(items),
      hydrated,
      isOpen,
      feedback,
      notice,
      dismissNotice,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      refreshStock,
      withLiveStock,
    }),
    [
      lines,
      items,
      hydrated,
      isOpen,
      feedback,
      notice,
      dismissNotice,
      openCart,
      closeCart,
      addItem,
      setQuantity,
      removeItem,
      clearCart,
      refreshStock,
      withLiveStock,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}

/**
 * The product with live stock applied. Pass `refresh` where a shopper decides how many to buy
 * (product page, quick view) so the quantity they see is current, not the hour-old catalogue copy.
 */
export function useLiveProduct(
  product: DemoProduct,
  options?: { refresh?: boolean },
): DemoProduct {
  const { withLiveStock, refreshStock } = useCart();
  const refresh = options?.refresh ?? false;
  const productId = product.id;
  useEffect(() => {
    if (refresh) void refreshStock([productId]);
  }, [refresh, productId, refreshStock]);
  return withLiveStock(product);
}
