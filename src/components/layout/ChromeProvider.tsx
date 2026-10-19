"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/** UI chrome state shared by the header, bottom bar and overlays (search + mobile menu). */
type ChromeContextValue = {
  searchOpen: boolean;
  menuOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  openMenu: () => void;
  closeMenu: () => void;
};

const ChromeContext = createContext<ChromeContextValue | null>(null);

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)
  );
}

export function ChromeProvider({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // "/" or Ctrl/Cmd+K opens search (never while typing in a field).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isShortcut =
        (event.key === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" &&
          !event.metaKey &&
          !event.ctrlKey &&
          !isTypingTarget(event.target));
      if (isShortcut) {
        event.preventDefault();
        openSearch();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  const value = useMemo(
    () => ({
      searchOpen,
      menuOpen,
      openSearch,
      closeSearch,
      openMenu,
      closeMenu,
    }),
    [searchOpen, menuOpen, openSearch, closeSearch, openMenu, closeMenu],
  );

  return (
    <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>
  );
}

export function useChrome() {
  const context = useContext(ChromeContext);
  if (!context) {
    throw new Error("useChrome must be used within ChromeProvider");
  }
  return context;
}
