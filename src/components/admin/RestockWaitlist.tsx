import { markRestockContactedAction } from "@/app/admin/actions";
import { AdminPanel, AdminPill } from "@/components/admin/admin-ui";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/ui/icons";
import { formatAdminDateTime } from "@/lib/admin/format";
import { customerWhatsAppHref } from "@/lib/orders/customer-contact";
import { getRestockStore } from "@/lib/stock/restock-requests";

/** Shoppers who asked to be told when this drink is back: emails are automatic, phones are for staff. */
export async function RestockWaitlist({
  productId,
  productName,
  orderableNow,
}: {
  productId: string;
  productName: string;
  orderableNow: boolean;
}) {
  const waiting = await getRestockStore().listWaiting({ productId });
  if (waiting.length === 0) return null;

  const emails = waiting.filter((request) => request.kind === "email");
  const phones = waiting.filter((request) => request.kind === "phone");

  return (
    <AdminPanel>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="font-display text-xl">Waiting for this drink</h2>
        <AdminPill tone={orderableNow ? "good" : "neutral"}>
          {waiting.length} {waiting.length === 1 ? "person" : "people"}
        </AdminPill>
      </div>
      <p className="mt-2 max-w-2xl text-sm text-ink-muted">
        {emails.length > 0
          ? `${emails.length} will get an automatic email as soon as it is back in stock. `
          : ""}
        {phones.length > 0
          ? orderableNow
            ? "It is in stock now: message the people below on WhatsApp, then mark them as done."
            : "People who left a phone number are listed below. Message them when it is back."
          : ""}
      </p>

      {phones.length > 0 ? (
        <ul className="mt-4 divide-y divide-brand-charcoal/10">
          {phones.map((request) => {
            const href = customerWhatsAppHref(
              request.contact,
              `Hello, ${productName} is back in stock at IP SHAP. Would you like to order it?`,
            );
            return (
              <li
                key={request.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div>
                  <p className="font-mono text-sm">{request.contact}</p>
                  <p className="text-xs text-ink-muted">
                    Asked {formatAdminDateTime(request.createdAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {href ? (
                    <Button
                      href={href}
                      variant="secondary"
                      size="sm"
                      iconLeft={<WhatsAppIcon size={16} />}
                    >
                      WhatsApp
                    </Button>
                  ) : null}
                  <ConfirmActionModal
                    triggerLabel="Mark as done"
                    title="Take them off the list?"
                    description="Do this after you have messaged them. Their phone number is then deleted automatically within a month."
                    confirmLabel="Mark as done"
                    action={markRestockContactedAction}
                    fields={{ id: request.id, productId }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </AdminPanel>
  );
}
