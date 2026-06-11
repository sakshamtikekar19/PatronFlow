import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Convert an arbitrary name into a clean, URL-safe, human-readable slug.
 *
 *   "Amaru"           -> "amaru"
 *   "The Blue Door"   -> "the-blue-door"
 *   "Koko Mumbai"     -> "koko-mumbai"
 *   "Café Crème!!"    -> "cafe-creme"
 */
export function slugify(input: string): string {
  const slug = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-") // non-alphanumerics -> hyphen
    .replace(/-{2,}/g, "-") // collapse repeats
    .replace(/^-+|-+$/g, ""); // trim hyphens

  return slug;
}

/**
 * Generate a slug that is unique within `table.slug`, appending -2, -3, …
 * on collision. Uses the provided client (pass an ADMIN client so the check
 * spans every tenant and is not narrowed by row-level security).
 *
 * `excludeId` lets a row keep its own slug when re-checking (e.g. on update).
 */
async function ensureUniqueSlug(
  client: SupabaseClient,
  table: string,
  base: string,
  excludeId?: string
): Promise<string> {
  let candidate = base;
  let suffix = 2;

  // Bounded loop to avoid any chance of an infinite spin.
  for (let attempt = 0; attempt < 1000; attempt++) {
    let query = client.from(table).select("id").eq("slug", candidate).limit(1);
    if (excludeId) query = query.neq("id", excludeId);

    const { data, error } = await query;
    if (error) throw new Error(`Slug check failed: ${error.message}`);
    if (!data || data.length === 0) return candidate;

    candidate = `${base}-${suffix}`;
    suffix += 1;
  }

  // Extremely unlikely fallback.
  return `${base}-${Date.now()}`;
}

export async function generateUniqueRestaurantSlug(
  client: SupabaseClient,
  name: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(name) || "restaurant";
  return ensureUniqueSlug(client, "restaurants", base, excludeId);
}

export async function generateUniqueEventSlug(
  client: SupabaseClient,
  title: string,
  excludeId?: string
): Promise<string> {
  const base = slugify(title) || "event";
  return ensureUniqueSlug(client, "events", base, excludeId);
}
