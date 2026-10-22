/** Shape every admin form action returns so modals can show errors and close on success. */
export type AdminActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export function actionOk(message?: string): AdminActionResult {
  return { ok: true, message };
}

export function actionError(error: string): AdminActionResult {
  return { ok: false, error };
}

/** Turns thrown errors into a safe message; logs the original. */
export function toActionError(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): AdminActionResult {
  // Next.js control-flow errors (redirect/notFound) must keep propagating.
  if (
    error &&
    typeof error === "object" &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_")
  ) {
    throw error;
  }
  const message = error instanceof Error ? error.message : "";
  console.error(JSON.stringify({ type: "admin_action_error", message }));
  return actionError(friendlyMessage(message) ?? fallback);
}

function friendlyMessage(message: string): string | null {
  const lower = message.toLowerCase();
  if (!message) return null;
  if (lower.includes("duplicate key") || lower.includes("already in use")) {
    return "That web address name is already used. Pick a different one.";
  }
  if (lower.startsWith("illegal fulfilment transition")) {
    return "That status change is not allowed from the order's current status.";
  }
  if (lower.includes("already marked paid")) {
    return "This order is already marked as paid.";
  }
  if (lower.includes("stock changed since")) {
    return "Stock changed since you opened this form. Close it and try again.";
  }
  if (lower.includes("not authorised")) {
    return "You do not have permission to do that.";
  }
  if (
    lower.startsWith("price ") ||
    lower.startsWith("discount ") ||
    lower.startsWith("stock ") ||
    lower.includes("is required") ||
    lower.includes("must be")
  ) {
    return message;
  }
  return null;
}
