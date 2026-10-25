"use client";

import {
  changeOwnPasswordAction,
  updateOwnProfileAction,
} from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input } from "@/components/ui/Field";

export function UpdateNameForm({
  displayName,
  email,
}: {
  displayName: string;
  email: string;
}) {
  return (
    <ActionForm
      action={updateOwnProfileAction}
      submitLabel="Save name"
      successMessage="Your name was saved."
    >
      <Field id="account-email" label="Email">
        <Input id="account-email" value={email} readOnly />
      </Field>
      <Field
        id="account-displayName"
        label="Display name"
        hint="Shown to teammates on the Team page."
      >
        <Input
          id="account-displayName"
          name="displayName"
          required
          maxLength={120}
          defaultValue={displayName}
          autoComplete="name"
        />
      </Field>
    </ActionForm>
  );
}

export function ChangePasswordForm() {
  return (
    <ActionForm
      action={changeOwnPasswordAction}
      submitLabel="Change password"
      successMessage="Your password was changed."
    >
      <Field id="account-currentPassword" label="Current password">
        <Input
          id="account-currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      <Field
        id="account-newPassword"
        label="New password"
        hint="At least 8 characters."
      >
        <Input
          id="account-newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
      <Field id="account-confirmPassword" label="Confirm new password">
        <Input
          id="account-confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
        />
      </Field>
    </ActionForm>
  );
}
