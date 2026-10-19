"use client";

import { useState, useTransition } from "react";
import { adminLoginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setError(null);
        startTransition(async () => {
          const result = await adminLoginAction(formData);
          if (result?.error) setError(result.error);
        });
      }}
    >
      <Field id="admin-email" label="Email">
        <Input
          id="admin-email"
          name="email"
          type="email"
          required
          autoComplete="username"
        />
      </Field>
      <Field
        id="admin-token"
        label="Bootstrap token"
        hint="From ADMIN_BOOTSTRAP_TOKEN on the server."
      >
        <Input
          id="admin-token"
          name="token"
          type="password"
          required
          autoComplete="current-password"
        />
      </Field>
      {error ? (
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
