"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { adminLoginAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

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
          placeholder="you@example.com"
        />
      </Field>
      <Field id="admin-password" label="Password">
        <div className="relative">
          <Input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="pr-12"
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-brand-charcoal/5 hover:text-brand-charcoal"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        </div>
      </Field>
      <div className="flex justify-end">
        <Link
          href="/admin/forgot-password"
          className="text-sm font-semibold text-brand-charcoal underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>
      {error ? (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
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
