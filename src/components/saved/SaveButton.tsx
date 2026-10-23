"use client";

import { HeartIcon } from "@/components/ui/icons";
import { useSavedIds } from "@/lib/device/use-saved";

/**
 * Save for later, kept on this device. `icon` is a small round toggle for cards; `button` is a
 * full-width labelled button for the product page.
 */
export function SaveButton({
  productId,
  productName,
  variant = "icon",
  className = "",
}: {
  productId: string;
  productName: string;
  variant?: "icon" | "button";
  className?: string;
}) {
  const { ids, toggle } = useSavedIds();
  const saved = ids.includes(productId);

  if (variant === "button") {
    return (
      <button
        type="button"
        aria-pressed={saved}
        onClick={() => toggle(productId)}
        className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-brand-charcoal/25 px-5 text-sm font-semibold transition-colors duration-[var(--motion-fast)] hover:border-brand-charcoal hover:bg-paper-2 ${className}`}
      >
        <HeartIcon
          size={18}
          fill={saved ? "currentColor" : "none"}
          className={saved ? "text-brand-burnt-orange" : undefined}
        />
        {saved ? "Saved for later" : "Save for later"}
      </button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${productName} from saved` : `Save ${productName}`}
      onClick={() => toggle(productId)}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-brand-charcoal transition-colors duration-[var(--motion-fast)] hover:bg-paper-2 ${className}`}
    >
      <HeartIcon
        size={20}
        fill={saved ? "currentColor" : "none"}
        className={saved ? "text-brand-burnt-orange" : undefined}
      />
    </button>
  );
}
