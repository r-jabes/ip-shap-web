/** Customer-facing checkout messages. They always name the product and say what to do next. */

export function unavailableMessage(productName: string): string {
  return `${productName} is out of stock or no longer available. Remove it from your cart and try again.`;
}

export function insufficientStockMessage(
  productName: string,
  available: number,
): string {
  const left = Math.max(0, Math.floor(available));
  if (left === 0) return unavailableMessage(productName);
  return `Only ${left} of ${productName} ${left === 1 ? "is" : "are"} left in stock. Lower the quantity to ${left} or less and try again.`;
}
