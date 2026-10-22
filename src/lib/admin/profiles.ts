import type { AdminRole } from "@/lib/admin/roles";
import { isAdminRole } from "@/lib/admin/roles";
import {
  checkMemberChange,
  memberStatus,
  type MemberStatus,
} from "@/lib/admin/team-rules";
import { getPublicEnv } from "@/lib/env";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type AdminProfileRow = {
  userId: string;
  email: string | null;
  role: AdminRole;
  displayName: string | null;
  isActive: boolean;
};

export type AdminMember = AdminProfileRow & {
  status: MemberStatus;
  invitedAt: string | null;
  lastSignInAt: string | null;
  createdAt: string;
};

type ProfileQueryRow = {
  user_id: string;
  role: string;
  display_name: string | null;
  is_active: boolean;
  created_at?: string;
};

export type ProfileResult =
  | { ok: true; userId: string }
  | { ok: false; error: string };

/** Where invite emails send people. Must be in the Supabase Auth redirect allow-list. */
export function inviteRedirectUrl(): string {
  const appUrl = getPublicEnv().NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  return `${appUrl}/admin/accept-invite`;
}

export async function fetchActiveAdminProfile(
  userId: string,
): Promise<AdminProfileRow | null> {
  const client = getSupabaseServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("admin_profiles")
    .select("user_id, role, display_name, is_active")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as ProfileQueryRow;
  if (!row.is_active || !isAdminRole(row.role)) return null;

  return {
    userId: row.user_id,
    email: null,
    role: row.role,
    displayName: row.display_name,
    isActive: row.is_active,
  };
}

type AuthUserSummary = {
  id: string;
  email?: string;
  invited_at?: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
};

async function loadAuthUsers(
  client: NonNullable<ReturnType<typeof getSupabaseServiceClient>>,
): Promise<Map<string, AuthUserSummary>> {
  const users = new Map<string, AuthUserSummary>();
  const perPage = 200;
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage });
    if (error || !data) break;
    for (const user of data.users) users.set(user.id, user);
    if (data.users.length < perPage) break;
  }
  return users;
}

/** Everyone with admin access, with sign-in state. Two queries total, regardless of team size. */
export async function listAdminMembers(): Promise<AdminMember[]> {
  const client = getSupabaseServiceClient();
  if (!client) return [];

  const [{ data, error }, authUsers] = await Promise.all([
    client
      .from("admin_profiles")
      .select("user_id, role, display_name, is_active, created_at")
      .order("created_at", { ascending: true }),
    loadAuthUsers(client),
  ]);

  if (error || !data) return [];

  const members: AdminMember[] = [];
  for (const row of data as ProfileQueryRow[]) {
    if (!isAdminRole(row.role)) continue;
    const user = authUsers.get(row.user_id);
    members.push({
      userId: row.user_id,
      email: user?.email ?? null,
      role: row.role,
      displayName: row.display_name,
      isActive: row.is_active,
      status: memberStatus({
        isActive: row.is_active,
        invitedAt: user?.invited_at ?? null,
        emailConfirmedAt: user?.email_confirmed_at ?? null,
      }),
      invitedAt: user?.invited_at ?? null,
      lastSignInAt: user?.last_sign_in_at ?? null,
      createdAt: row.created_at ?? "",
    });
  }
  return members;
}

export async function inviteAdminByEmail(input: {
  email: string;
  role: AdminRole;
  displayName?: string;
  /** Null when the actor is break-glass bootstrap (no Auth user id). */
  invitedByUserId: string | null;
}): Promise<ProfileResult> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return { ok: false, error: "Supabase service role is not configured." };
  }

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }

  const { data: invited, error: inviteError } =
    await client.auth.admin.inviteUserByEmail(email, {
      redirectTo: inviteRedirectUrl(),
    });

  let userId = invited?.user?.id;
  if (inviteError || !userId) {
    // The person may already have an account — attach admin access to it.
    const authUsers = await loadAuthUsers(client);
    const existing = Array.from(authUsers.values()).find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (!existing) {
      return { ok: false, error: inviteError?.message ?? "Invite failed." };
    }
    userId = existing.id;
  }

  const { data: existingProfile } = await client
    .from("admin_profiles")
    .select("user_id, is_active")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingProfile) {
    return {
      ok: false,
      error: existingProfile.is_active
        ? "That person is already on the team."
        : "That person is already on the team but deactivated. Reactivate them instead.",
    };
  }

  return upsertProfile({
    userId,
    role: input.role,
    displayName: input.displayName,
    createdBy: input.invitedByUserId,
  });
}

/** Sends a fresh invite email to someone who has not accepted yet. */
export async function resendInvite(input: {
  userId: string;
  actorUserId: string | null;
}): Promise<ProfileResult> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return { ok: false, error: "Supabase service role is not configured." };
  }

  const { data: userData } = await client.auth.admin.getUserById(input.userId);
  const user = userData.user;
  if (!user?.email) return { ok: false, error: "Member not found." };
  if (user.email_confirmed_at) {
    return { ok: false, error: "This person has already accepted the invite." };
  }

  const { error } = await client.auth.admin.inviteUserByEmail(user.email, {
    redirectTo: inviteRedirectUrl(),
  });
  if (error) return { ok: false, error: error.message };

  await client.from("audit_events").insert({
    actor_user_id: input.actorUserId,
    action: "admin.invite_resend",
    entity_type: "admin_profiles",
    entity_id: input.userId,
    metadata: {},
  });
  return { ok: true, userId: input.userId };
}

/** Change a member's name, role or active state. Applies team-safety rules. */
export async function updateAdminMember(input: {
  userId: string;
  actorUserId: string | null;
  displayName?: string | null;
  role?: AdminRole;
  isActive?: boolean;
}): Promise<ProfileResult> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return { ok: false, error: "Supabase service role is not configured." };
  }

  const { data: rows, error } = await client
    .from("admin_profiles")
    .select("user_id, role, is_active");
  if (error || !rows) return { ok: false, error: "Could not load the team." };

  const profiles = (rows as ProfileQueryRow[]).filter((row) =>
    isAdminRole(row.role),
  );
  const target = profiles.find((row) => row.user_id === input.userId);
  if (!target || !isAdminRole(target.role)) {
    return { ok: false, error: "Member not found." };
  }

  const refusal = checkMemberChange({
    actorUserId: input.actorUserId,
    target: {
      userId: target.user_id,
      role: target.role,
      isActive: target.is_active,
    },
    next: { role: input.role, isActive: input.isActive },
    activeOwnerCount: profiles.filter(
      (row) => row.role === "owner" && row.is_active,
    ).length,
  });
  if (refusal) return { ok: false, error: refusal };

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (input.displayName !== undefined) patch.display_name = input.displayName;
  if (input.role !== undefined) patch.role = input.role;
  if (input.isActive !== undefined) patch.is_active = input.isActive;

  const { error: updateError } = await client
    .from("admin_profiles")
    .update(patch)
    .eq("user_id", input.userId);
  if (updateError) return { ok: false, error: updateError.message };

  await client.from("audit_events").insert({
    actor_user_id: input.actorUserId,
    action:
      input.isActive === undefined
        ? "admin.update"
        : input.isActive
          ? "admin.reactivate"
          : "admin.deactivate",
    entity_type: "admin_profiles",
    entity_id: input.userId,
    metadata: { role: input.role ?? null },
  });

  return { ok: true, userId: input.userId };
}

async function upsertProfile(input: {
  userId: string;
  role: AdminRole;
  displayName?: string;
  createdBy: string | null;
}): Promise<ProfileResult> {
  const client = getSupabaseServiceClient();
  if (!client) {
    return { ok: false, error: "Supabase service role is not configured." };
  }

  const { error } = await client.from("admin_profiles").upsert(
    {
      user_id: input.userId,
      role: input.role,
      display_name: input.displayName ?? null,
      is_active: true,
      created_by: input.createdBy,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  await client.from("audit_events").insert({
    actor_user_id: input.createdBy,
    action: "admin.invite",
    entity_type: "admin_profiles",
    entity_id: input.userId,
    metadata: { role: input.role },
  });

  return { ok: true, userId: input.userId };
}
