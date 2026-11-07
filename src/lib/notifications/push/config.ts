import { getPublicEnv, getServerEnv } from "@/lib/env";

export type WebPushConfig = {
  publicKey: string;
  privateKey: string;
  subject: string;
};

/**
 * Returns VAPID config when all three env vars are set; otherwise null.
 * Push subscribe UI and send path should no-op / skip until this is non-null.
 */
export function getWebPushConfig(): WebPushConfig | null {
  const publicKey = getPublicEnv().NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  const privateKey = getServerEnv().VAPID_PRIVATE_KEY?.trim();
  const subject = getServerEnv().VAPID_SUBJECT?.trim();
  if (!publicKey || !privateKey || !subject) return null;
  return { publicKey, privateKey, subject };
}

export function isWebPushConfigured(): boolean {
  return getWebPushConfig() !== null;
}
