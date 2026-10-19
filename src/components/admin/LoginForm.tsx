"use client";

import { useState, useTransition } from "react";
import { adminLoginAction } from "@/app/admin/actions";

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
      <label className="block text-sm">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="username"
          className="mt-1 w-full border border-brand-warm-white/30 bg-transparent px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Bootstrap token
        <input
          name="token"
          type="password"
          required
          autoComplete="current-password"
          className="mt-1 w-full border border-brand-warm-white/30 bg-transparent px-3 py-2"
        />
      </label>
      {error ? (
        <p className="text-sm text-brand-burnt-orange" role="alert">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-burnt-orange px-4 py-2 text-sm font-medium text-brand-charcoal disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
