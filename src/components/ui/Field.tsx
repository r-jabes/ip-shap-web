import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import { CheckIcon, ChevronDownIcon } from "@/components/ui/icons";

const control =
  "w-full rounded-2xl border border-brand-charcoal/30 bg-white/60 px-4 text-base text-brand-charcoal placeholder:text-ink-muted transition-[border-color,background-color] duration-[var(--motion-fast)] hover:border-brand-charcoal focus:border-brand-charcoal focus:bg-white disabled:opacity-50 aria-[invalid=true]:border-red-700";

/** Label + control + hint/error wrapper. Wires ids and aria-describedby. */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className = "",
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 text-sm text-red-800"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Input({
  className = "",
  pill = false,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { pill?: boolean }) {
  return (
    <input
      className={`${control} h-12 ${pill ? "rounded-full" : ""} ${className}`}
      {...props}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative block">
      <select
        className={`${control} h-12 appearance-none pr-11 ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon
        size={18}
        className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2"
      />
    </span>
  );
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`${control} min-h-[6.5rem] resize-y py-3 ${className}`}
      {...props}
    />
  );
}

/** Custom checkbox with a native input underneath (keyboard + form friendly). */
export function Checkbox({
  label,
  count,
  className = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: ReactNode;
  count?: number;
}) {
  return (
    <label
      className={`group flex min-h-11 items-center gap-3 text-[0.95rem] ${props.disabled ? "opacity-40" : ""} ${className}`}
    >
      <input type="checkbox" className="peer sr-only" {...props} />
      <span
        aria-hidden="true"
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 border-brand-charcoal bg-transparent text-transparent transition-colors duration-[var(--motion-fast)] group-hover:bg-paper-2 peer-checked:bg-brand-burnt-orange peer-checked:text-brand-charcoal peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)]"
      >
        <CheckIcon size={14} strokeWidth={3} />
      </span>
      <span className="flex-1">{label}</span>
      {typeof count === "number" ? (
        <span className="text-xs text-ink-muted tabular">{count}</span>
      ) : null}
    </label>
  );
}
