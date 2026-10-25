"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  actionError,
  actionOk,
  toActionError,
  type AdminActionResult,
} from "@/lib/admin/action-result";
import { getAdminSession } from "@/lib/admin/session";
import { roleHasPermission } from "@/lib/admin/roles";
import { revalidateCatalogueStock } from "@/lib/catalogue/cache";
import { notifyOrderEvent } from "@/lib/notifications/log";
import { formatFulfilmentLabel } from "@/lib/admin/orders-query";
import {
  markManualPaymentDurable,
  transitionFulfilmentDurable,
} from "@/lib/orders/durable";
import {
  INVALID_PAYMENT_AMOUNT_MESSAGE,
  isValidPaymentAmount,
} from "@/lib/orders/manual-payment";
import type { FulfilmentStatus } from "@/lib/orders/transitions";
import { FULFILMENT_FLOW } from "@/lib/orders/transitions";

async function requireStaff() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleHasPermission(session.role, "orders:manage")) {
    throw new Error("Not authorised.");
  }
  return session;
}

function isFulfilmentStatus(value: string): value is FulfilmentStatus {
  return value === "cancelled" || FULFILMENT_FLOW.includes(value as FulfilmentStatus);
}

/**
 * Moves an order to a new fulfilment status (any later step, or cancelled).
 * A reason is only required when cancelling; otherwise it is optional and a plain
 * "Marked as …" line is written to the history.
 */
export async function adminTransitionFulfilmentAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireStaff();
    const orderId = String(formData.get("orderId") ?? "");
    const target = String(formData.get("to") ?? "");
    if (!isFulfilmentStatus(target)) {
      return actionError("Choose a status to move this order to.");
    }
    const to = target;
    const note = String(formData.get("reason") ?? "").trim().slice(0, 500);
    if (to === "cancelled" && !note) {
      return actionError("Tell us why the order is being cancelled.");
    }
    const reason = note || `Marked as ${formatFulfilmentLabel(to)}`;

    const order = await transitionFulfilmentDurable(
      orderId,
      to,
      reason,
      session.email,
    );
    notifyOrderEvent({
      templateId: to === "cancelled" ? "order_cancelled" : "fulfilment_update",
      orderReference: order.reference,
      idempotencyKey: `fulfilment-${order.id}-${to}-${Date.now()}`,
      variables: { status: to },
    });
    // Cancelling puts the reserved units back on the shelf.
    if (to === "cancelled") revalidateCatalogueStock();
    revalidatePath("/admin", "layout");
    return actionOk(`Order marked as ${formatFulfilmentLabel(to)}.`);
  } catch (error) {
    return toActionError(error);
  }
}

/**
 * Records a payment taken outside the site. Amount is required (and may differ from the order
 * total, e.g. after a discount); reference and note are optional.
 */
export async function adminMarkPaymentAction(
  formData: FormData,
): Promise<AdminActionResult> {
  try {
    const session = await requireStaff();
    const orderId = String(formData.get("orderId") ?? "");
    const reference = String(formData.get("paymentReference") ?? "")
      .trim()
      .slice(0, 120);
    const note = String(formData.get("reason") ?? "").trim().slice(0, 500);
    const amount = Number(
      String(formData.get("amount") ?? "").replace(/[,\s]/g, ""),
    );
    if (!isValidPaymentAmount(amount)) {
      return actionError(INVALID_PAYMENT_AMOUNT_MESSAGE);
    }

    const order = await markManualPaymentDurable(orderId, {
      amount,
      reference: reference || undefined,
      note: note || undefined,
      actorLabel: session.email,
    });
    notifyOrderEvent({
      templateId: "payment_received",
      orderReference: order.reference,
      idempotencyKey: `manual-paid-${order.id}`,
    });
    revalidatePath("/admin", "layout");
    return actionOk("Payment recorded.");
  } catch (error) {
    return toActionError(error);
  }
}
