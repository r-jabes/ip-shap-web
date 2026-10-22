import { redirect } from "next/navigation";
import {
  resendInviteAction,
  setMemberActiveAction,
} from "@/app/admin/actions";
import {
  AdminCard,
  AdminPageHeader,
  AdminPill,
  AdminTable,
  AdminTd,
  AdminTh,
} from "@/components/admin/admin-ui";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { ConfirmActionModal } from "@/components/admin/ConfirmActionModal";
import {
  EditMemberModal,
  InviteModal,
} from "@/components/admin/TeamModals";
import { formatAdminDate } from "@/lib/admin/format";
import { paginateItems, parseAdminPage } from "@/lib/admin/pagination";
import { listAdminMembers, type AdminMember } from "@/lib/admin/profiles";
import { roleHasPermission } from "@/lib/admin/roles";
import { getAdminSession } from "@/lib/admin/session";
import type { MemberStatus } from "@/lib/admin/team-rules";

const STATUS: Record<
  MemberStatus,
  { label: string; tone: "good" | "warn" | "muted" }
> = {
  active: { label: "Active", tone: "good" },
  invited: { label: "Invite pending", tone: "warn" },
  deactivated: { label: "Deactivated", tone: "muted" },
};

const ROLE_LABEL = { owner: "Owner", manager: "Manager", staff: "Staff" } as const;

function MemberActions({
  member,
  isSelf,
}: {
  member: AdminMember;
  isSelf: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <EditMemberModal
        userId={member.userId}
        displayName={member.displayName}
        email={member.email}
        role={member.role}
      />
      {member.status === "invited" ? (
        <ConfirmActionModal
          triggerLabel="Resend invite"
          title="Resend invite?"
          description={`We will email ${member.email ?? "this person"} a fresh invite link.`}
          confirmLabel="Resend invite"
          action={resendInviteAction}
          fields={{ userId: member.userId }}
        />
      ) : null}
      {member.status === "deactivated" ? (
        <ConfirmActionModal
          triggerLabel="Reactivate"
          title="Reactivate this person?"
          description={`${member.displayName || member.email || "This person"} will be able to sign in again.`}
          confirmLabel="Reactivate"
          action={setMemberActiveAction}
          fields={{ userId: member.userId, active: "true" }}
        />
      ) : isSelf ? null : (
        <ConfirmActionModal
          triggerLabel="Deactivate"
          title="Deactivate this person?"
          description={`${member.displayName || member.email || "This person"} will lose access straight away. Their history stays, and you can reactivate them later.`}
          confirmLabel="Deactivate"
          action={setMemberActiveAction}
          fields={{ userId: member.userId, active: "false" }}
        />
      )}
    </div>
  );
}

export default async function AdminTeamPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getAdminSession();
  if (!session || !roleHasPermission(session.role, "admins:manage")) {
    redirect("/admin");
  }

  const params = await searchParams;
  const members = await listAdminMembers();
  const pending = members.filter((member) => member.status === "invited");
  const pageResult = paginateItems(members, parseAdminPage(params.page));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Team"
        description="Invite colleagues and manage who can sign in."
        actions={<InviteModal />}
      />

      {pending.length > 0 ? (
        <p
          className="rounded-2xl border border-amber-600/40 bg-amber-50 px-4 py-3 text-sm text-amber-900"
          role="status"
        >
          {pending.length === 1
            ? "1 person has not accepted their invite yet: "
            : `${pending.length} people have not accepted their invite yet: `}
          {pending.map((member) => member.email ?? "unknown").join(", ")}.
        </p>
      ) : null}

      {pageResult.total === 0 ? (
        <div className="rounded-[var(--radius-frame)] border-2 border-dashed border-brand-charcoal/20 px-6 py-10 text-center">
          <p className="text-sm text-ink-muted">
            No team members yet. Invite your first colleague.
          </p>
        </div>
      ) : (
        <>
          <AdminTable
            mobile={pageResult.items.map((member) => (
              <AdminCard key={member.userId}>
                <p className="font-semibold">
                  {member.displayName || member.email || "Unknown"}
                </p>
                {member.displayName && member.email ? (
                  <p className="text-sm break-all text-ink-muted">
                    {member.email}
                  </p>
                ) : null}
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <AdminPill tone={STATUS[member.status].tone}>
                    {STATUS[member.status].label}
                  </AdminPill>
                  <AdminPill>{ROLE_LABEL[member.role]}</AdminPill>
                </div>
                <p className="mt-2 text-xs text-ink-muted">
                  {member.lastSignInAt
                    ? `Last signed in ${formatAdminDate(member.lastSignInAt)}`
                    : "Has not signed in yet"}
                </p>
                <div className="mt-3">
                  <MemberActions
                    member={member}
                    isSelf={member.userId === session.sub}
                  />
                </div>
              </AdminCard>
            ))}
          >
            <thead>
              <tr>
                <AdminTh>Person</AdminTh>
                <AdminTh>Role</AdminTh>
                <AdminTh>Status</AdminTh>
                <AdminTh>Last sign-in</AdminTh>
                <AdminTh>
                  <span className="sr-only">Actions</span>
                </AdminTh>
              </tr>
            </thead>
            <tbody>
              {pageResult.items.map((member) => (
                <tr key={member.userId}>
                  <AdminTd>
                    <p className="font-medium">
                      {member.displayName || member.email || "Unknown"}
                    </p>
                    {member.displayName && member.email ? (
                      <p className="text-xs text-ink-muted">{member.email}</p>
                    ) : null}
                  </AdminTd>
                  <AdminTd>{ROLE_LABEL[member.role]}</AdminTd>
                  <AdminTd>
                    <AdminPill tone={STATUS[member.status].tone}>
                      {STATUS[member.status].label}
                    </AdminPill>
                  </AdminTd>
                  <AdminTd className="whitespace-nowrap text-ink-muted">
                    {member.lastSignInAt
                      ? formatAdminDate(member.lastSignInAt)
                      : "Never"}
                  </AdminTd>
                  <AdminTd>
                    <MemberActions
                      member={member}
                      isSelf={member.userId === session.sub}
                    />
                  </AdminTd>
                </tr>
              ))}
            </tbody>
          </AdminTable>
          <AdminPagination
            pathname="/admin/team"
            searchParams={{}}
            result={pageResult}
            label="team members"
          />
        </>
      )}
    </div>
  );
}
