"use client";

import { useState, useTransition } from "react";
import { inviteAdminAction } from "@/app/admin/actions";
import { AdminPanel } from "@/components/admin/admin-ui";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";

export function InviteAdminForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <AdminPanel className="max-w-xl">
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          setError(null);
          setOk(false);
          startTransition(async () => {
            const result = await inviteAdminAction(formData);
            if (result?.error) setError(result.error);
            else if (result?.ok) {
              setOk(true);
              event.currentTarget.reset();
            }
          });
        }}
      >
        <Field id="invite-email" label="Email">
          <Input
            id="invite-email"
            name="email"
            type="email"
            required
            autoComplete="off"
          />
        </Field>
        <Field id="invite-name" label="Display name (optional)">
          <Input id="invite-name" name="displayName" autoComplete="off" />
        </Field>
        <Field id="invite-role" label="Role">
          <Select id="invite-role" name="role" defaultValue="staff">
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
            <option value="owner">Owner</option>
          </Select>
        </Field>
        {error ? (
          <p className="text-sm text-red-800" role="alert">
            {error}
          </p>
        ) : null}
        {ok ? (
          <p className="text-sm text-brand-charcoal" role="status">
            Invite sent. They set a password from the email link.
          </p>
        ) : null}
        <Button type="submit" variant="primary" loading={pending}>
          {pending ? "Sending…" : "Send invite"}
        </Button>
      </form>
    </AdminPanel>
  );
}
