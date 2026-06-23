import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/security/admin-access";
import type { Restaurant } from "@/types";

export async function getRestaurantForUser(): Promise<Restaurant | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", user.id)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Re-provision a restaurant row when the owner account exists but their
 * restaurant was deleted manually (e.g. from the Supabase table editor).
 * Mirrors the on_auth_user_created trigger; also fires the trial subscription trigger.
 */
export async function ensureRestaurantForUser(): Promise<Restaurant | null> {
  const existing = await getRestaurantForUser();
  if (existing) return existing;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  if (isSuperAdmin(user)) return null;

  const admin = createAdminClient();
  const name =
    (user.user_metadata?.restaurant_name as string | undefined)?.trim() ||
    "My Restaurant";

  const { data, error } = await admin
    .from("restaurants")
    .insert({ owner_id: user.id, name })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return getRestaurantForUser();
    }
    return null;
  }

  return data;
}

export async function getRestaurantById(
  id: string
): Promise<Restaurant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public lookup for the review page. Resolves a restaurant by its slug, and
 * (for backward compatibility with already-printed ID-based QR codes) falls
 * back to an id match when the param looks like a UUID. Uses the admin client
 * so it bypasses row-level security on this public route.
 */
export async function getRestaurantBySlugOrId(
  slugOrId: string
): Promise<Restaurant | null> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("restaurants")
    .select("*")
    .eq("slug", slugOrId)
    .maybeSingle();

  if (data) return data;

  if (UUID_RE.test(slugOrId)) {
    const { data: byId } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", slugOrId)
      .maybeSingle();
    return byId ?? null;
  }

  return null;
}
