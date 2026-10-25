"use client";

import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Button, type ButtonVariant } from "@/components/ui/Button";
import type { AdminActionResult } from "@/lib/admin/action-result";

/**
 * Form that runs a server action, shows errors inline, toasts on success and
 * calls `onDone` (usually "close the modal"). The action revalidates pages, so
 * tables behind the modal update on their own.
 */
export function ActionForm({
  action,
  children,
  submitLabel,
  pendingLabel = "Saving…",
  submitVariant = "primary",
  successMessage,
  onDone,
  onCancel,
  className = "grid gap-5",
}: {
  action: (formData: FormData) => Promise<AdminActionResult>;
  children: ReactNode;
  submitLabel: string;
  pendingLabel?: string;
  submitVariant?: ButtonVariant;
  successMessage?: string;
  onDone?: () => void;
  onCancel?: () => void;
  className?: string;
}) {
  const toast = useAdminToast();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(formData);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        toast.success(result.message ?? successMessage ?? "Saved.");
        onDone?.();
      } catch {
        setError("Could not reach the server. Check your connection and try again.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className={className}>
      {children}
      {error ? (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel ? (
          <Button variant="ghost" size="md" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          variant={submitVariant}
          size="md"
          loading={pending}
        >
          {pending ? pendingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
