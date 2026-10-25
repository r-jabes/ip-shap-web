/**
 * Notification channels. Email is live today; WhatsApp and SMS slot in later by implementing
 * `NotificationChannel` and registering it in `channels.ts` — nothing else has to change.
 */
export type NotificationChannelId = "email" | "whatsapp" | "sms";

/** What a notification is about. Each kind is rendered by the channel that sends it. */
export type NotificationKind =
  | "staff_new_order"
  | "staff_low_stock"
  | "customer_back_in_stock";

export type OutboxMessage = {
  id: string;
  channel: NotificationChannelId;
  kind: NotificationKind;
  dedupeKey: string;
  payload: Record<string, unknown>;
  /** Attempts including the one now in progress. */
  attempts: number;
};

export type DeliveryResult =
  | { ok: true; skipped?: string }
  | { ok: false; error: string };

export interface NotificationChannel {
  readonly id: NotificationChannelId;
  deliver(message: OutboxMessage): Promise<DeliveryResult>;
}
