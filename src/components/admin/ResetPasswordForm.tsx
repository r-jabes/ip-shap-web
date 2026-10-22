"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Field";
import { EyeIcon, EyeOffIcon } from "@/components/ui/icons";
import { createBrowserAuthClient } from "@/lib/supabase/browser-auth";

export function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const client = createBrowserAuthClient();
    if (!client) {
      setSessionError("Password reset is temporarily unavailable.");
      return;
    }

    let cancelled = false;
    let settled = false;

    const markReady = () => {
      if (cancelled || settled) return;
      settled = true;
      setReady(true);
    };

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        markReady();
      }
    });

    void client.auth.getSession().then(({ data }) => {
      if (data.session) markReady();
    });

    const timeoutId = window.setTimeout(() => {
      if (cancelled || settled) return;
      void client.auth.getSession().then(({ data }) => {
        if (cancelled || settled) return;
        if (data.session) {
          markReady();
          return;
        }
        settled = true;
        setSessionError(
          "This reset link is invalid or has expired. Request a new one.",
        );
      });
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  if (sessionError) {
    return (
      <div className="mt-8 space-y-4">
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {sessionError}
        </p>
        <Link
          href="/admin/forgot-password"
          className="block text-center text-sm font-semibold underline-offset-4 hover:underline"
        >
          Request a new link
        </Link>
      </div>
    );
  }

  if (!ready) {
    return (
      <p className="mt-8 text-sm text-ink-muted" role="status">
        Verifying reset link…
      </p>
    );
  }

  return (
    <form
      className="mt-8 space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const password = String(formData.get("password") ?? "");
        const confirm = String(formData.get("confirm") ?? "");
        setError(null);

        if (password.length < 8) {
          setError("Use at least 8 characters.");
          return;
        }
        if (password !== confirm) {
          setError("Passwords do not match.");
          return;
        }

        startTransition(async () => {
          const client = createBrowserAuthClient();
          if (!client) {
            setError("Password reset is temporarily unavailable.");
            return;
          }
          const { error: updateError } = await client.auth.updateUser({
            password,
          });
          if (updateError) {
            setError(updateError.message || "Could not update password.");
            return;
          }
          await client.auth.signOut({ scope: "local" });
          router.replace("/admin/login");
          router.refresh();
        });
      }}
    >
      <Field id="new-password" label="New password">
        <div className="relative">
          <Input
            id="new-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
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
      <Field id="confirm-password" label="Confirm password">
        <Input
          id="confirm-password"
          name="confirm"
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          autoComplete="new-password"
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
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        loading={pending}
      >
        {pending ? "Saving…" : "Save new password"}
      </Button>
    </form>
  );
}
