import type { AdminRole } from "@/lib/admin/roles";
import { isAdminRole } from "@/lib/admin/roles";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

export type AdminProfileRow = {
  userId: string;
  email: string | null;
  role: AdminRole;
  displayName: string | null;
  isActive: boolean;
};

type ProfileQueryRow = {
  user_id: string;
  role: string;
  display_name: string | null;
  is_active: boolean;
};

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

export async function listAdminProfiles(): Promise<AdminProfileRow[]> {
  const client = getSupabaseServiceClient();
  if (!client) return [];

  const { data, error } = await client
    .from("admin_profiles")
    .select("user_id, role, display_name, is_active")
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const rows = data as ProfileQueryRow[];
  const withEmail: AdminProfileRow[] = [];

  for (const row of rows) {
    if (!isAdminRole(row.role)) continue;
    let email: string | null = null;
    const { data: userData } = await client.auth.admin.getUserById(row.user_id);
    email = userData.user?.email ?? null;
    withEmail.push({
      userId: row.user_id,
      email,
      role: row.role,
      displayName: row.display_name,
      isActive: row.is_active,
    });
  }

  return withEmail;
}

export async function inviteAdminByEmail(input: {
  email: string;
  role: AdminRole;
  displayName?: string;
  /** Null when the actor is break-glass bootstrap (no Auth user id). */
  invitedByUserId: string | null;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
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
      redirectTo: undefined,
    });

  if (inviteError || !invited.user) {
    // User may already exist — try lookup then attach profile.
    const { data: listed } = await client.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    const existing = listed?.users.find(
      (user) => user.email?.toLowerCase() === email,
    );
    if (!existing) {
      return {
        ok: false,
        error: inviteError?.message ?? "Invite failed.",
      };
    }
    return upsertProfile({
      userId: existing.id,
      role: input.role,
      displayName: input.displayName,
      createdBy: input.invitedByUserId,
    });
  }

  return upsertProfile({
    userId: invited.user.id,
    role: input.role,
    displayName: input.displayName,
    createdBy: input.invitedByUserId,
  });
}

async function upsertProfile(input: {
  userId: string;
  role: AdminRole;
  displayName?: string;
  createdBy: string | null;
}): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
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
