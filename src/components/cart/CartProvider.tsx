"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartLine } from "@/domain/catalogue";
import {
  CART_STORAGE_KEY,
  LEGACY_CART_KEYS,
  type CartItem,
  cartItemCount,
  cartSubtotal,
  clampQuantity,
  parseStoredCart,
  resolveCart,
} from "@/lib/cart";
import { getProductById } from "@/lib/catalogue";
import { MOTION } from "@/lib/motion";

type CartContextValue = {
  /** Raw stored lines. Prefer `items` for anything rendered. */
  lines: CartLine[];
  /** Resolved lines (product data attached). Count, drawer, cart page and checkout all use this. */
  items: CartItem[];
  /** Total units across resolved items only. */
  itemCount: number;
  /** Integer RWF subtotal of resolved items. */
  subtotal: number;
  /** False until localStorage has been read (avoid empty-state flashes). */
  hydrated: boolean;
  isOpen: boolean;
  /** Concise text confirmation for cart changes (also announced live). */
  feedback: string | null;
  /** Shown once when stale lines were removed from a saved cart. */
  notice: string | null;
  dismissNotice: () => void;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function removalNotice(count: number): string {
  return count === 1
    ? "One item in your saved cart is no longer available and was removed."
    : `${count} items in your saved cart are no longer available and were removed.`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Load once, validate, discard legacy storage and prune unresolvable lines.
  useEffect(() => {
    try {
      for (const key of LEGACY_CART_KEYS) {
        window.localStorage.removeItem(key);
      }
      const stored = parseStoredCart(
        window.localStorage.getItem(CART_STORAGE_KEY),
      );
      const { items, removed } = resolveCart(stored, getProductById);
      setLines(
        items.map(({ productId, quantity }) => ({ productId, quantity })),
      );
      if (removed.length > 0) setNotice(removalNotice(removed.length));
    } catch {
      // Storage unavailable (private mode, quota): start with an empty cart.
    }
    setHydrated(true);
  }, []);

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
      const { items } = resolveCart(stored, getProductById);
      setLines(
        items.map(({ productId, quantity }) => ({ productId, quantity })),
      );
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const id = window.setTimeout(
      () => setFeedback(null),
      MOTION.editorialMs * 4,
    );
    return () => window.clearTimeout(id);
  }, [feedback]);

  const addItem = useCallback((productId: string, quantity = 1) => {
    const product = getProductById(productId);
    if (!product) {
      setFeedback("Sorry, that item is no longer available.");
      return;
    }
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) {
        return current.map((line) =>
          line.productId === productId
            ? { ...line, quantity: clampQuantity(line.quantity + quantity) }
            : line,
        );
      }
      return [...current, { productId, quantity: clampQuantity(quantity) }];
    });
    setFeedback(`Added ${product.name} to your cart`);
    setIsOpen(true);
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) => {
      if (quantity <= 0) {
        return current.filter((line) => line.productId !== productId);
      }
      return current.map((line) =>
        line.productId === productId
          ? { ...line, quantity: clampQuantity(quantity) }
          : line,
      );
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setLines((current) =>
      current.filter((line) => line.productId !== productId),
    );
  }, []);

  const clearCart = useCallback(() => setLines([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const items = useMemo(
    () => resolveCart(lines, getProductById).items,
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      items,
      itemCount: cartItemCount(items),
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
