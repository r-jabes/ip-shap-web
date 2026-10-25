"use client";

import { useState } from "react";
import {
  adminMarkPaymentAction,
  adminTransitionFulfilmentAction,
} from "@/app/admin/order-actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { FulfilmentBadge } from "@/components/admin/OrderStatusBadge";
import { Field, Input, Select } from "@/components/ui/Field";
import { formatFulfilmentLabel } from "@/lib/admin/orders-query";
import { formatRwf } from "@/lib/money";
import {
  fulfilmentFlowFor,
  type FulfilmentStatus,
  type FulfillmentMethod,
} from "@/lib/orders/transitions";

type TriggerProps = {
  triggerLabel?: string;
  triggerVariant?: "primary" | "secondary" | "ghost";
  triggerSize?: "sm" | "md";
};

/** Steps that would be skipped by jumping from `from` straight to `to`. */
function skippedSteps(
  from: FulfilmentStatus,
  to: FulfilmentStatus,
  method: FulfillmentMethod,
): FulfilmentStatus[] {
  const flow = fulfilmentFlowFor(method);
  const fromIndex = flow.indexOf(from);
  const toIndex = flow.indexOf(to);
  if (fromIndex < 0 || toIndex < 0) return [];
  return flow.slice(fromIndex + 1, toIndex);
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function FulfilmentModal({
  orderId,
  reference,
  current,
  options,
  method = "delivery",
  triggerLabel = "Update order status",
  triggerVariant = "secondary",
  triggerSize = "sm",
}: {
  orderId: string;
  reference: string;
  current: FulfilmentStatus;
  /** Every status this order may move to, in journey order, "cancelled" last. */
  options: FulfilmentStatus[];
  method?: FulfillmentMethod;
} & TriggerProps) {
  return (
    <AdminModal
      triggerLabel={triggerLabel}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title="Update order status"
      description={`Order ${reference}. Pick any step, you do not have to go one at a time. The customer is notified.`}
      width="sm"
    >
      {(close) =>
        options.length === 0 ? (
          <p className="text-sm text-ink-muted">
            This order is finished, so its status can no longer change.
          </p>
        ) : (
          <FulfilmentForm
            orderId={orderId}
            current={current}
            options={options}
            method={method}
            onClose={close}
          />
        )
      }
    </AdminModal>
  );
}

function FulfilmentForm({
  orderId,
  current,
  options,
  method,
  onClose,
}: {
  orderId: string;
  current: FulfilmentStatus;
  options: FulfilmentStatus[];
  method: FulfillmentMethod;
  onClose: () => void;
}) {
  const [to, setTo] = useState<FulfilmentStatus>(options[0]!);
  // Controlled so a failed save does not wipe what was typed.
  const [reason, setReason] = useState("");
  const cancelling = to === "cancelled";
  const skipped = skippedSteps(current, to, method);
  const fieldId = `fulfilment-${orderId}`;

  return (
    <ActionForm
      action={adminTransitionFulfilmentAction}
      submitLabel={cancelling ? "Cancel order" : "Update status"}
      submitVariant={cancelling ? "secondary" : "primary"}
      onDone={onClose}
      onCancel={onClose}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-muted">Now</span>
        <FulfilmentBadge status={current} />
      </div>
      <Field id={`${fieldId}-to`} label="Move to">
        <Select
          id={`${fieldId}-to`}
          name="to"
          value={to}
          onChange={(event) => setTo(event.target.value as FulfilmentStatus)}
        >
          {options.map((status, index) => (
            <option key={status} value={status}>
              {status === "cancelled"
                ? "Cancel order"
                : `${formatFulfilmentLabel(status)}${index === 0 ? " (next step)" : ""}`}
            </option>
          ))}
        </Select>
      </Field>
      {skipped.length > 0 && !cancelling ? (
        <p className="-mt-2 text-sm text-ink-muted">
          This skips {joinList(skipped.map(formatFulfilmentLabel))}.
        </p>
      ) : null}
      <Field
        id={`${fieldId}-reason`}
        label={cancelling ? "Reason for cancelling" : "Note (optional)"}
        hint={
          cancelling
            ? "Required. Reserved stock goes back on the shelf and the customer is told."
            : "Anything worth remembering. Shown in the order history."
        }
      >
        <Input
          id={`${fieldId}-reason`}
          name="reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          required={cancelling}
          maxLength={500}
        />
      </Field>
    </ActionForm>
  );
}

export function PaymentModal({
  orderId,
  reference,
  total,
  alreadyPaid,
  triggerLabel,
  triggerVariant = "ghost",
  triggerSize = "sm",
}: {
  orderId: string;
  reference: string;
  /** Order total in RWF, used as the starting amount. */
  total: number;
  alreadyPaid: boolean;
} & TriggerProps) {
  return (
    <AdminModal
      triggerLabel={triggerLabel ?? (alreadyPaid ? "Payment recorded" : "Record payment")}
      triggerVariant={triggerVariant}
      triggerSize={triggerSize}
      title="Record a payment"
      description={`Order ${reference}. Use this only after you have checked the money yourself, for example a bank or mobile money receipt.`}
      width="sm"
    >
      {(close) =>
        alreadyPaid ? (
          <p className="text-sm text-ink-muted">
            This order is already marked as paid.
          </p>
        ) : (
          <PaymentForm orderId={orderId} total={total} onClose={close} />
        )
      }
    </AdminModal>
  );
}

function PaymentForm({
  orderId,
  total,
  onClose,
}: {
  orderId: string;
  total: number;
  onClose: () => void;
}) {
  // Controlled so a failed save does not wipe what was typed.
  const [amount, setAmount] = useState(String(total));
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");

  const parsed = Number(amount.replace(/[,\s]/g, ""));
  const valid = Number.isInteger(parsed) && parsed > 0;
  const difference = valid ? parsed - total : 0;
  const fieldId = `payment-${orderId}`;

  return (
    <ActionForm
      action={adminMarkPaymentAction}
      submitLabel="Mark as paid"
      onDone={onClose}
      onCancel={onClose}
    >
      <input type="hidden" name="orderId" value={orderId} />
      <Field
        id={`${fieldId}-amount`}
        label="Amount received (RWF)"
        hint={
          !valid
            ? "Enter a whole number, for example 45000."
            : difference === 0
              ? `Matches the order total of ${formatRwf(total)}.`
              : difference < 0
                ? `${formatRwf(Math.abs(difference))} less than the order total of ${formatRwf(total)}, for example a discount.`
                : `${formatRwf(difference)} more than the order total of ${formatRwf(total)}.`
        }
      >
        <Input
          id={`${fieldId}-amount`}
          name="amount"
          inputMode="numeric"
          autoComplete="off"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
        />
      </Field>
      <Field
        id={`${fieldId}-ref`}
        label="Payment reference (optional)"
        hint="The transaction or receipt number, if you have one."
      >
        <Input
          id={`${fieldId}-ref`}
          name="paymentReference"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          maxLength={120}
        />
      </Field>
      <Field
        id={`${fieldId}-note`}
        label="Note (optional)"
        hint="How it was paid, for example MTN MoMo or bank transfer."
      >
        <Input
          id={`${fieldId}-note`}
          name="reason"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          maxLength={500}
        />
      </Field>
    </ActionForm>
  );
}
