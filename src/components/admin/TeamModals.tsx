"use client";

import { inviteAdminAction, updateMemberAction } from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { AdminModal } from "@/components/admin/AdminModal";
import { Field, Input, Select } from "@/components/ui/Field";
import type { AdminRole } from "@/lib/admin/roles";

const ROLE_HELP =
  "Staff: edit products, stock and orders. Manager: also prices and imports. Owner: everything, including the team.";

export function InviteModal() {
  return (
    <AdminModal
      triggerLabel="Invite teammate"
      title="Invite a teammate"
      description="They get an email with a link to choose their password."
      width="sm"
    >
      {(close) => (
        <ActionForm
          action={inviteAdminAction}
          submitLabel="Send invite"
          pendingLabel="Sending…"
          onDone={close}
          onCancel={close}
        >
          <Field id="invite-email" label="Email">
            <Input
              id="invite-email"
              name="email"
              type="email"
              required
              autoComplete="off"
              placeholder="name@company.com"
            />
          </Field>
          <Field id="invite-name" label="Name (optional)">
            <Input id="invite-name" name="displayName" autoComplete="off" />
          </Field>
          <Field id="invite-role" label="Role" hint={ROLE_HELP}>
            <Select id="invite-role" name="role" defaultValue="staff">
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </Select>
          </Field>
        </ActionForm>
      )}
    </AdminModal>
  );
}

export function EditMemberModal({
  userId,
  displayName,
  email,
  role,
}: {
  userId: string;
  displayName: string | null;
  email: string | null;
  role: AdminRole;
}) {
  return (
    <AdminModal
      triggerLabel="Edit"
      triggerVariant="ghost"
      title="Edit team member"
      description={email ?? undefined}
      width="sm"
    >
      {(close) => (
        <ActionForm
          action={updateMemberAction}
          submitLabel="Save changes"
          onDone={close}
          onCancel={close}
        >
          <input type="hidden" name="userId" value={userId} />
          <Field id="member-name" label="Name">
            <Input
              id="member-name"
              name="displayName"
              defaultValue={displayName ?? ""}
              autoComplete="off"
            />
          </Field>
          <Field id="member-role" label="Role" hint={ROLE_HELP}>
            <Select id="member-role" name="role" defaultValue={role}>
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
            </Select>
          </Field>
        </ActionForm>
      )}
    </AdminModal>
  );
}
