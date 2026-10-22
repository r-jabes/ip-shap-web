import { adminListAudits, type AuditEvent } from "@/lib/admin/store";
import { hasSupabaseServiceConfig } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/** Maps actor ids to emails with one lookup per distinct person (not per row). */
export async function resolveActorEmails(
  ids: Array<string | null | undefined>,
): Promise<Map<string, string>> {
  const client = getSupabaseServiceClient();
  const unique = Array.from(new Set(ids.filter((id): id is string => !!id)));
  const result = new Map<string, string>();
  if (!client || unique.length === 0) return result;

  await Promise.all(
    unique.map(async (id) => {
      const { data } = await client.auth.admin.getUserById(id);
      if (data.user?.email) result.set(id, data.user.email);
    }),
  );
  return result;
}

export async function listAuditsDurable(limit = 8): Promise<AuditEvent[]> {
  if (!hasSupabaseServiceConfig()) return adminListAudits(limit);

  const client = getSupabaseServiceClient()!;
  const { data, error } = await client
    .from("audit_events")
    .select("id, actor_user_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);

  const rows = data ?? [];
  const emails = await resolveActorEmails(rows.map((row) => row.actor_user_id));
  return rows.map((row) => ({
    id: row.id,
    actorEmail: row.actor_user_id
      ? (emails.get(row.actor_user_id) ?? null)
      : null,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id ?? undefined,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
  }));
}
