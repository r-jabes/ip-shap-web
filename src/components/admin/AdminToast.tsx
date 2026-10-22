"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Toast = { id: number; message: string; tone: "success" | "error" };

type ToastApi = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

/** No-op fallback so forms still render if used outside the admin shell (tests, previews). */
const NOOP: ToastApi = { success: () => {}, error: () => {} };

export function useAdminToast(): ToastApi {
  return useContext(ToastContext) ?? NOOP;
}

export function AdminToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const push = useCallback((message: string, tone: Toast["tone"]) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    window.setTimeout(
      () => setToasts((current) => current.filter((toast) => toast.id !== id)),
      tone === "error" ? 7000 : 4000,
    );
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push(message, "success"),
      error: (message) => push(message, "error"),
    }),
    [push],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <p
            key={toast.id}
            role={toast.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto max-w-md rounded-full border-2 px-5 py-2.5 text-sm font-semibold shadow-[3px_3px_0_0_var(--brand-charcoal)] ${
              toast.tone === "error"
                ? "border-red-800 bg-red-50 text-red-900"
                : "border-brand-charcoal bg-brand-warm-white text-brand-charcoal"
            }`}
          >
            {toast.message}
          </p>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
