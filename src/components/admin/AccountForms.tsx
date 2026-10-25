"use client";

import { useState } from "react";
import {
  changeOwnPasswordAction,
  updateOwnProfileAction,
} from "@/app/admin/actions";
import { ActionForm } from "@/components/admin/ActionForm";
import { Field, Input } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

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

function PasswordField({
  id,
  name,
  label,
  hint,
  autoComplete,
  minLength,
}: {
  id: string;
  name: string;
  label: string;
  hint?: string;
  autoComplete: string;
  minLength?: number;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <Field id={id} label={label} hint={hint}>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className="pr-12"
        />
        <button
          type="button"
          className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-brand-charcoal/5 hover:text-brand-charcoal"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          onClick={() => setVisible((value) => !value)}
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>
    </Field>
  );
}

export function ChangePasswordForm() {
  return (
    <ActionForm
      action={changeOwnPasswordAction}
      submitLabel="Change password"
      successMessage="Your password was changed."
    >
      <PasswordField
        id="account-currentPassword"
        name="currentPassword"
        label="Current password"
        autoComplete="current-password"
      />
      <PasswordField
        id="account-newPassword"
        name="newPassword"
        label="New password"
        hint="At least 8 characters."
        autoComplete="new-password"
        minLength={8}
      />
      <PasswordField
        id="account-confirmPassword"
        name="confirmPassword"
        label="Confirm new password"
        autoComplete="new-password"
        minLength={8}
      />
    </ActionForm>
  );
}
