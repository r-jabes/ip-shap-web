"use client";

import {
  adminMarkPaymentAction,
  adminTransitionFulfilmentAction,
} from "@/app/admin/order-actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { Field, Input, Select } from "@/components/ui/Field";

export function FulfilmentModal({
  orderId,
  options,
}: {
  orderId: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <AdminModal
      triggerLabel="Update order status"
      triggerVariant="secondary"
      title="Update order status"
      description="The customer is notified when the status changes."
      width="sm"
    >
      {(close) =>
        options.length === 0 ? (
          <p className="text-sm text-ink-muted">
            This order is finished, so its status can no longer change.
          </p>
        ) : (
          <ActionForm
            action={adminTransitionFulfilmentAction}
            submitLabel="Update status"
            onDone={close}
            onCancel={close}
          >
            <input type="hidden" name="orderId" value={orderId} />
            <Field id="fulfilment-to" label="New status">
              <Select id="fulfilment-to" name="to" defaultValue={options[0]?.value}>
                {options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              id="fulfilment-reason"
              label="Reason"
              hint="A short note for the order history."
            >
              <Input id="fulfilment-reason" name="reason" required />
            </Field>
          </ActionForm>
        )
      }
    </AdminModal>
  );
}

export function PaymentModal({
  orderId,
  alreadyPaid,
}: {
  orderId: string;
  alreadyPaid: boolean;
}) {
  return (
    <AdminModal
      triggerLabel={alreadyPaid ? "Payment recorded" : "Record payment"}
      triggerVariant="ghost"
      title="Record a payment"
      description="Use this only after you have checked the payment yourself, for example a bank or mobile money receipt."
      width="sm"
    >
      {(close) =>
        alreadyPaid ? (
          <p className="text-sm text-ink-muted">
            This order is already marked as paid.
          </p>
        ) : (
          <ActionForm
            action={adminMarkPaymentAction}
            submitLabel="Mark as paid"
            onDone={close}
            onCancel={close}
          >
            <input type="hidden" name="orderId" value={orderId} />
            <Field
              id="payment-ref"
              label="Payment reference"
              hint="The transaction or receipt number."
            >
              <Input id="payment-ref" name="paymentReference" required />
            </Field>
            <Field
              id="payment-reason"
              label="Note"
              hint="How the payment was made, for example MTN MoMo or bank transfer."
            >
              <Input id="payment-reason" name="reason" required />
            </Field>
          </ActionForm>
        )
      }
    </AdminModal>
  );
}
