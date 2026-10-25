"use client";

import { useState, useTransition } from "react";
import { requestAdminPasswordResetAction } from "@/app/admin/password-actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        setMessage(null);
        startTransition(async () => {
          const result = await requestAdminPasswordResetAction(formData);
          if (result.error) setError(result.error);
          if (result.message) setMessage(result.message);
        });
      }}
    >
      <Field id="reset-email" label="Email">
        <Input
          id="reset-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          placeholder="you@example.com"
        />
      </Field>
      {error ? (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}
      {message ? (
        <p
          className="rounded-2xl bg-paper-2 px-4 py-3 text-sm text-ink-muted"
          role="status"
        >
          {message}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        {pending ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
