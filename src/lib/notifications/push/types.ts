/**
 * Browser PushSubscription JSON shape we persist and send with.
 * Keys are base64url (no padding required by browsers; store verbatim).
 */
export type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

export type StoredPushSubscription = {
  id: string;
  adminUserId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string | null;
  createdAt: string;
  lastSeenAt: string;
  disabledAt: string | null;
};

/** Compact payload shown by the service worker (keep well under 4KB). */
export type StaffPushPayload = {
  title: string;
  body: string;
  /** Absolute or site-relative URL opened on notification click. */
  url: string;
  tag?: string;
};
