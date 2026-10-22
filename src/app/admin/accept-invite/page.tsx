import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { ResetPasswordForm } from "@/components/admin/ResetPasswordForm";

export default function AdminAcceptInvitePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-brand-charcoal px-4 py-12 text-brand-warm-white">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, var(--brand-burnt-orange), transparent 45%), radial-gradient(circle at 80% 70%, var(--brand-warm-white), transparent 40%)",
        }}
      />
      <div className="relative w-full max-w-md rounded-[var(--radius-panel)] border-2 border-brand-warm-white/25 bg-brand-warm-white p-6 text-brand-charcoal shadow-[6px_6px_0_0_var(--brand-burnt-orange)] sm:p-8">
        <BrandLogo tone="on-paper" height={40} href="/" />
        <h1 className="font-display mt-6 text-3xl">Welcome to the team</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Choose a password to finish setting up your account. You will use it
          to sign in.
        </p>
        <ResetPasswordForm mode="invite" />
        <p className="mt-8 text-center text-sm text-ink-muted">
          <Link
            href="/admin/login"
            className="font-semibold underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
