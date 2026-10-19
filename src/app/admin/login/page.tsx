import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

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
      <div className="relative w-full max-w-md rounded-[var(--radius-panel)] border-2 border-brand-warm-white/25 bg-brand-warm-white p-8 text-brand-charcoal shadow-[6px_6px_0_0_var(--brand-burnt-orange)]">
        <BrandLogo tone="on-paper" height={40} href="/" />
        <h1 className="font-display mt-6 text-3xl">Admin sign-in</h1>
        <p className="mt-2 text-sm text-ink-muted">
          No public registration. Use the bootstrap token from your server
          environment. Errors do not reveal whether an account exists.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
