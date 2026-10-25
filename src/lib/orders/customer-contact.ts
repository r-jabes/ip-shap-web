/**
 * Deep links for staff to message the *customer* (not business WhatsApp).
 * Digits only for wa.me; tel: keeps leading +.
 */
export function customerWhatsAppHref(
  phone: string,
  message?: string,
): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // wa.me needs the country code: 0788 123 456 -> 250788123456.
  if (/^07\d{8}$/.test(digits)) digits = `250${digits.slice(1)}`;
  const text = message
    ? `?text=${encodeURIComponent(message)}`
    : "";
  return `https://wa.me/${digits}${text}`;
}

/** Ready-to-send WhatsApp text for an order, worded for the shopper (staff can edit before sending). */
export function orderUpdateMessage(input: {
  customerName: string;
  reference: string;
  statusLabel: string;
  shopName?: string;
}): string {
  const firstName = input.customerName.trim().split(/\s+/)[0] || "there";
  return `Hello ${firstName}, this is ${input.shopName ?? "IP SHAP"} about your order ${input.reference}. Status: ${input.statusLabel}.`;
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
