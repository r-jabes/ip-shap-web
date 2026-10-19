import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdminSession } from "@/lib/admin/session";
import { SHORT_BRAND } from "@/lib/brand";

export default async function AdminLoginPage() {
  const session = await getAdminSession();
  if (session) redirect("/admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-charcoal px-4 text-brand-warm-white">
      <div className="w-full max-w-md border border-brand-warm-white/20 p-8">
        <h1 className="font-display text-3xl">{SHORT_BRAND} Admin</h1>
        <p className="mt-2 text-sm text-brand-warm-white/70">
          No public registration. Use the bootstrap token from your server
          environment (documented one-time provisioning). Errors do not reveal
          whether an account exists.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
