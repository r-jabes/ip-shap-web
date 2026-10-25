import { redirect } from "next/navigation";
import {
  ChangePasswordForm,
  UpdateNameForm,
} from "@/components/admin/AccountForms";
import {
  AdminPageHeader,
  AdminPanel,
} from "@/components/admin/admin-ui";
import { fetchActiveAdminProfile } from "@/lib/admin/profiles";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminAccountPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const isBootstrap = session.sub.startsWith("bootstrap:");
  const profile = isBootstrap
    ? null
    : await fetchActiveAdminProfile(session.sub);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Your account"
        description="Update the name teammates see, and change your password."
      />

      {isBootstrap ? (
        <AdminPanel>
          <p className="text-sm text-ink-muted">
            You are using an emergency login. Sign in with your normal email
            account to change your name or password.
          </p>
        </AdminPanel>
      ) : (
        <>
          <AdminPanel className="max-w-xl space-y-4">
            <h2 className="font-display text-xl">Profile</h2>
            <UpdateNameForm
              displayName={profile?.displayName ?? ""}
              email={session.email}
            />
          </AdminPanel>
          <AdminPanel className="max-w-xl space-y-4">
            <h2 className="font-display text-xl">Password</h2>
            <p className="text-sm text-ink-muted">
              You will need your current password. After changing it, keep using
              this browser session — you do not need to sign in again.
            </p>
            <ChangePasswordForm />
          </AdminPanel>
        </>
      )}
    </div>
  );
}
