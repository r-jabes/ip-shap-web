"use client";

import { useState, useTransition } from "react";
import { adminLoginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [breakGlass, setBreakGlass] = useState(false);

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
      {!breakGlass ? (
        <Field
          id="admin-password"
          label="Password"
          hint="Invite-only Supabase Auth. No public registration."
        >
          <Input
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </Field>
      ) : (
        <Field
          id="admin-token"
          label="Break-glass token"
          hint="Emergency only — ADMIN_BOOTSTRAP_TOKEN. Prefer Supabase Auth."
        >
          <Input
            id="admin-token"
            name="token"
            type="password"
            required
            autoComplete="off"
          />
        </Field>
      )}
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
      <button
        type="button"
        className="w-full text-center text-xs text-ink-muted underline-offset-2 hover:underline"
        onClick={() => setBreakGlass((value) => !value)}
      >
        {breakGlass ? "Use password sign-in" : "Break-glass token instead"}
      </button>
    </form>
  );
}
