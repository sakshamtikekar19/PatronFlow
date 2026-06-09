function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/** Build the public review URL for a restaurant, optionally scoped to a table. */
export function buildReviewUrl(
  restaurantId: string,
  tableName?: string
): string {
  const base = `${getBaseUrl()}/r/${restaurantId}`;
  if (!tableName) return base;
  return `${base}?table=${encodeURIComponent(tableName)}`;
}
