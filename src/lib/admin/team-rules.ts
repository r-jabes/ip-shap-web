import type { AdminRole } from "@/lib/admin/roles";

export type MemberStatus = "active" | "invited" | "deactivated";

export type MemberChangeInput = {
  actorUserId: string | null;
  target: { userId: string; role: AdminRole; isActive: boolean };
  next: { role?: AdminRole; isActive?: boolean };
  /** Active owners right now, including the target when applicable. */
  activeOwnerCount: number;
};

/**
 * Returns a plain-English reason when a team change must be refused, otherwise null.
 * Protects against locking everyone out and against owners removing their own access by accident.
 */
export function checkMemberChange(input: MemberChangeInput): string | null {
  const { actorUserId, target, next, activeOwnerCount } = input;
  const nextRole = next.role ?? target.role;
  const nextActive = next.isActive ?? target.isActive;

  const losesAccess =
    (target.isActive && !nextActive) ||
    (target.role === "owner" && nextRole !== "owner");

  if (actorUserId && target.userId === actorUserId && losesAccess) {
    return "You cannot remove your own access. Ask another owner to do it.";
  }

  const wasActiveOwner = target.isActive && target.role === "owner";
  const stillActiveOwner = nextActive && nextRole === "owner";
  if (wasActiveOwner && !stillActiveOwner && activeOwnerCount <= 1) {
    return "There must always be at least one active owner.";
  }

  return null;
}

export function memberStatus(input: {
  isActive: boolean;
  invitedAt: string | null;
  emailConfirmedAt: string | null;
}): MemberStatus {
  if (!input.isActive) return "deactivated";
  if (input.invitedAt && !input.emailConfirmedAt) return "invited";
  return "active";
}
