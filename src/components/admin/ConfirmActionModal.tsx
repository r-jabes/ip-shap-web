"use client";

import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import type { ButtonSize, ButtonVariant } from "@/components/ui/Button";
import type { AdminActionResult } from "@/lib/admin/action-result";

/** One-click confirmation dialog for actions without extra input (archive, deactivate, remove…). */
export function ConfirmActionModal({
  triggerLabel,
  triggerVariant = "ghost",
  triggerSize = "sm",
  title,
  description,
  confirmLabel,
  action,
  fields,
  successMessage,
}: {
  triggerLabel: string;
  triggerVariant?: ButtonVariant;
  triggerSize?: ButtonSize;
  title: string;
  description: string;
  confirmLabel: string;
  action: (formData: FormData) => Promise<AdminActionResult>;
  fields: Record<string, string>;
  successMessage?: string;
}) {
  return (
    <AdminModal
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title={title}
      width="sm"
    >
      {(close) => (
        <ActionForm
          action={action}
          submitLabel={confirmLabel}
          pendingLabel="Working…"
          submitVariant="secondary"
          successMessage={successMessage}
          onDone={close}
          onCancel={close}
        >
          <p className="text-sm text-ink-muted">{description}</p>
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        </ActionForm>
      )}
    </AdminModal>
  );
}
