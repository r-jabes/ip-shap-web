import { redirect } from "next/navigation";
import { eraseCustomerDataAction } from "@/app/admin/actions";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";
import {
  parseCustomerPhone,
  summariseCustomerData,
} from "@/lib/privacy/customer-data";
import { HISTORY_RETENTION_MONTHS } from "@/lib/privacy/retention";

/** Handle "give me my data" and "delete my data" requests from a customer, by phone number. */
export default async function AdminPrivacyPage({
  searchParams,
}: {
  searchParams: Promise<{ phone?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roleHasPermission(session.role, "admins:manage")) redirect("/admin");

  const { phone: rawPhone } = await searchParams;
  const searched = (rawPhone ?? "").trim();
  const phone = searched ? parseCustomerPhone(searched) : null;
  const summary = phone ? await summariseCustomerData(phone) : null;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer privacy"
        description="When a customer asks what we know about them, or asks us to delete it, start here. Only owners can use this page."
      />

      <AdminPanel>
        <form method="get" className="grid max-w-md gap-4">
          <Field
            id="phone"
            label="Customer phone number"
            hint="The number they used at checkout, in any format."
            error={
              searched && !phone ? "That does not look like a valid phone number." : undefined
            }
          >
            <Input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              required
              defaultValue={searched}
              autoComplete="off"
            />
          </Field>
          <Button type="submit" className="w-full sm:w-auto">
            Look up
          </Button>
        </form>
      </AdminPanel>

      {phone && summary ? (
        <AdminPanel>
          <h2 className="font-display text-xl">What we hold</h2>
          <ul className="mt-3 space-y-1 text-sm">
            <li>
              <strong>{summary.orders}</strong> order(s), of which{" "}
              <strong>{summary.ordersInProgress}</strong> still in progress
            </li>
            <li>
              <strong>{summary.waitingRequests}</strong> “tell me when it is back”
              request(s) by phone
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              href={`/admin/export/customer?phone=${encodeURIComponent(phone)}`}
              variant="secondary"
              size="sm"
            >
              Download their data
            </Button>
            <ConfirmActionModal
              triggerLabel="Remove their personal details"
              title="Remove this customer's details?"
              description="On finished orders the name, phone number, address and notes are blanked. The order totals and items stay for your accounts. Their stock requests are deleted. Orders still in progress are not touched. This cannot be undone."
              confirmLabel="Remove details"
              action={eraseCustomerDataAction}
              fields={{ phone }}
            />
          </div>
        </AdminPanel>
      ) : null}

      <AdminPanel>
        <h2 className="font-display text-xl">What is deleted automatically</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-muted">
          <li>Sent emails in the outgoing queue: after 30 days.</li>
          <li>“Tell me when it is back” requests: 30 days after we answer, or after 6 months if never answered.</li>
          <li>Stock history and this activity log: after {HISTORY_RETENTION_MONTHS} months.</li>
        </ul>
      </AdminPanel>
    </div>
  );
}
