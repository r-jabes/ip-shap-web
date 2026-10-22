import { redirect } from "next/navigation";
import {
  AdminPageHeader,
  AdminPanel,
  AdminStatus,
} from "@/components/admin/admin-ui";
import { InviteAdminForm } from "@/components/admin/InviteAdminForm";
import { listAdminProfiles } from "@/lib/admin/profiles";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";

export default async function AdminTeamPage() {
  const session = await getAdminSession();
  if (!session || !roleHasPermission(session.role, "admins:manage")) {
    redirect("/admin");
  }

  const profiles = await listAdminProfiles();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Team"
        description="Invite colleagues and manage access."
      />

      <section className="space-y-3">
        <h2 className="font-display text-xl">Invite a teammate</h2>
        <InviteAdminForm />
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-xl">Members</h2>
        {profiles.length === 0 ? (
          <AdminStatus>No team members yet.</AdminStatus>
        ) : (
          <AdminPanel>
            <ul className="divide-y divide-brand-charcoal/10">
              {profiles.map((profile) => (
                <li
                  key={profile.userId}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-semibold">
                      {profile.displayName || profile.email || profile.userId}
                    </p>
                    {profile.email ? (
                      <p className="text-sm text-ink-muted">{profile.email}</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
                    {profile.role}
                    {!profile.isActive ? " · inactive" : ""}
                  </p>
                </li>
              ))}
            </ul>
          </AdminPanel>
        )}
      </section>
    </div>
  );
}
