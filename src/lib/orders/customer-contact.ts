/**
 * Deep links for staff to message the *customer* (not business WhatsApp).
 * Digits only for wa.me; tel: keeps leading +.
 */
export function customerWhatsAppHref(
  phone: string,
  message?: string,
): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  const text = message
    ? `?text=${encodeURIComponent(message)}`
    : "";
  return `https://wa.me/${digits}${text}`;
}

export function customerTelHref(phone: string): string | null {
  const trimmed = phone.trim();
  if (!trimmed) return null;
  const normalized = trimmed.startsWith("+")
    ? `+${trimmed.slice(1).replace(/\D/g, "")}`
    : trimmed.replace(/\D/g, "");
  if (normalized.replace(/\D/g, "").length < 8) return null;
  return `tel:${normalized}`;
}
