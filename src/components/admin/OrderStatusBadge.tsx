import {
  formatFulfilmentLabel,
  formatPaymentLabel,
} from "@/lib/admin/orders-query";
import type {
  FulfilmentStatus,
  PaymentStatus,
} from "@/lib/orders/transitions";

type Tone = { pill: string; dot: string };

/** One colour per order stage so a glance at a list tells the story. */
const FULFILMENT_TONES: Record<FulfilmentStatus, Tone> = {
  awaiting_confirmation: {
    pill: "border-amber-400 bg-amber-100 text-amber-950",
    dot: "bg-amber-500",
  },
  confirmed: {
    pill: "border-sky-400 bg-sky-100 text-sky-950",
    dot: "bg-sky-500",
  },
  processing: {
    pill: "border-indigo-400 bg-indigo-100 text-indigo-950",
    dot: "bg-indigo-500",
  },
  ready_for_dispatch: {
    pill: "border-violet-400 bg-violet-100 text-violet-950",
    dot: "bg-violet-500",
  },
  out_for_delivery: {
    pill: "border-teal-400 bg-teal-100 text-teal-950",
    dot: "bg-teal-500",
  },
  delivered: {
    pill: "border-emerald-500 bg-emerald-100 text-emerald-950",
    dot: "bg-emerald-600",
  },
  ready_for_pickup: {
    pill: "border-violet-400 bg-violet-100 text-violet-950",
    dot: "bg-violet-500",
  },
  picked_up: {
    pill: "border-emerald-500 bg-emerald-100 text-emerald-950",
    dot: "bg-emerald-600",
  },
  cancelled: {
    pill: "border-red-400 bg-red-100 text-red-950",
    dot: "bg-red-600",
  },
};

const PAYMENT_TONES: Record<PaymentStatus, Tone> = {
  paid: {
    pill: "border-emerald-500 bg-emerald-100 text-emerald-950",
    dot: "bg-emerald-600",
  },
  unpaid: {
    pill: "border-orange-400 bg-orange-100 text-orange-950",
    dot: "bg-orange-500",
  },
  pending: {
    pill: "border-amber-400 bg-amber-100 text-amber-950",
    dot: "bg-amber-500",
  },
  failed: {
    pill: "border-red-400 bg-red-100 text-red-950",
    dot: "bg-red-600",
  },
  cancelled: {
    pill: "border-brand-charcoal/25 bg-brand-charcoal/5 text-ink-muted",
    dot: "bg-brand-charcoal/40",
  },
  refunded: {
    pill: "border-purple-400 bg-purple-100 text-purple-950",
    dot: "bg-purple-500",
  },
  not_applicable: {
    pill: "border-brand-charcoal/20 bg-brand-charcoal/5 text-ink-muted",
    dot: "bg-brand-charcoal/30",
  },
};

function Badge({
  tone,
  label,
  prefix,
  size,
}: {
  tone: Tone;
  label: string;
  prefix?: string;
  size: "sm" | "lg";
}) {
  const sizing =
    size === "lg" ? "gap-2 px-3.5 py-1.5 text-sm" : "gap-1.5 px-2.5 py-0.5 text-xs";
  return (
    <span
      className={`inline-flex items-center rounded-full border-2 font-semibold whitespace-nowrap ${sizing} ${tone.pill}`}
    >
      <span
        aria-hidden="true"
        className={`${size === "lg" ? "h-2.5 w-2.5" : "h-2 w-2"} shrink-0 rounded-full ${tone.dot}`}
      />
      {prefix ? <span className="font-medium opacity-70">{prefix}</span> : null}
      {label}
    </span>
  );
}

export function FulfilmentBadge({
  status,
  size = "sm",
  withPrefix = false,
}: {
  status: FulfilmentStatus;
  size?: "sm" | "lg";
  /** Adds "Order:" so the badge is self-explanatory when shown next to a payment badge. */
  withPrefix?: boolean;
}) {
  return (
    <Badge
      tone={FULFILMENT_TONES[status]}
      label={formatFulfilmentLabel(status)}
      prefix={withPrefix ? "Order:" : undefined}
      size={size}
    />
  );
}

export function PaymentBadge({
  status,
  size = "sm",
  withPrefix = false,
}: {
  status: PaymentStatus;
  size?: "sm" | "lg";
  withPrefix?: boolean;
}) {
  return (
    <Badge
      tone={PAYMENT_TONES[status]}
      label={formatPaymentLabel(status)}
      prefix={withPrefix ? "Payment:" : undefined}
      size={size}
    />
  );
}
