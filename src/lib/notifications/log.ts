export type NotificationTemplateId =
  | "order_awaiting_confirmation"
  | "order_confirmed"
  | "payment_received"
  | "order_cancelled"
  | "fulfilment_update";

type NotificationInput = {
  templateId: NotificationTemplateId;
  orderReference: string;
  idempotencyKey: string;
  variables?: Record<string, string>;
};

const sent = new Set<string>();

/** Log-only notification adapter — no third-party credentials. */
export function notifyOrderEvent(input: NotificationInput): {
  ok: boolean;
  skippedDuplicate?: boolean;
} {
  if (sent.has(input.idempotencyKey)) {
    return { ok: true, skippedDuplicate: true };
  }
  console.info(
    JSON.stringify({
      type: "notification",
      channel: "log",
      templateId: input.templateId,
      orderReference: input.orderReference,
      idempotencyKey: input.idempotencyKey,
      variables: input.variables ?? {},
    }),
  );
  sent.add(input.idempotencyKey);
  return { ok: true };
}

export function resetNotificationIdempotencyForTests() {
  sent.clear();
}
