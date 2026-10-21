"use server";

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { roleHasPermission } from "@/lib/admin/roles";
import { notifyOrderEvent } from "@/lib/notifications/log";
import {
  markManualPaymentDurable,
  transitionFulfilmentDurable,
} from "@/lib/orders/durable";
import type { FulfilmentStatus } from "@/lib/orders/transitions";

async function requireStaff() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleHasPermission(session.role, "orders:manage")) {
    throw new Error("Not authorised.");
  }
  return session;
}

export async function adminTransitionFulfilmentAction(formData: FormData) {
  const session = await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const to = String(formData.get("to") ?? "") as FulfilmentStatus;
  const reason = String(formData.get("reason") ?? "").trim();
  if (!reason) throw new Error("Reason is required.");
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
  redirect(`/admin/orders/${order.id}?updated=1`);
}

export async function adminMarkPaymentAction(formData: FormData) {
  const session = await requireStaff();
  const orderId = String(formData.get("orderId") ?? "");
  const reference = String(formData.get("paymentReference") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const order = await markManualPaymentDurable(orderId, {
    reference,
    reason,
    actorLabel: session.email,
  });
  notifyOrderEvent({
    templateId: "payment_received",
    orderReference: order.reference,
    idempotencyKey: `manual-paid-${order.id}-${reference}`,
  });
  redirect(`/admin/orders/${order.id}?paid=1`);
}
