import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
