function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/**
 * Build the public review URL for a restaurant, optionally scoped to a table.
 * Uses the SEO-friendly slug (e.g. /review/the-blue-door). Falls back to the
 * id only if a slug is somehow missing, so links never break.
 */
export function buildReviewUrl(
  slugOrId: string,
  tableName?: string
): string {
  const base = `${getBaseUrl()}/review/${slugOrId}`;
  if (!tableName) return base;
  return `${base}?table=${encodeURIComponent(tableName)}`;
}

/** Build the public RSVP page URL for an event (QR destination). */
export function buildEventUrl(slugOrId: string): string {
  return `${getBaseUrl()}/events/${slugOrId}`;
}
