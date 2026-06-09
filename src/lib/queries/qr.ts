import { createClient } from "@/lib/supabase/server";
import type { TableQr, TableQrAnalytics } from "@/types";

export async function getTableQrs(restaurantId: string): Promise<TableQr[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("table_qrs")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data;
}

/**
 * Per-table analytics derived from feedback.source / feedback.table_name.
 * Includes an "Overall" row (no table) plus one row per created table QR.
 */
export async function getTableAnalytics(
  restaurantId: string
): Promise<TableQrAnalytics[]> {
  const supabase = await createClient();

  const [{ data: feedback }, { data: tables }] = await Promise.all([
    supabase
      .from("feedback")
      .select("rating, table_name, review_clicked")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("table_qrs")
      .select("table_name")
      .eq("restaurant_id", restaurantId)
      .order("created_at", { ascending: true }),
  ]);

  const rows = feedback ?? [];

  // Group feedback by table name (null -> "Direct / No table")
  const groups = new Map<
    string,
    { ratings: number[]; reviews: number }
  >();

  const ensure = (key: string) => {
    if (!groups.has(key)) groups.set(key, { ratings: [], reviews: 0 });
    return groups.get(key)!;
  };

  rows.forEach((f) => {
    const key = f.table_name?.trim() || "Direct / No table";
    const group = ensure(key);
    group.ratings.push(f.rating);
    if (f.review_clicked) group.reviews += 1;
  });

  // Ensure every created table appears even with zero feedback
  (tables ?? []).forEach((t) => ensure(t.table_name));

  return Array.from(groups.entries())
    .map(([tableName, { ratings, reviews }]) => ({
      tableName,
      feedbackCount: ratings.length,
      reviewCount: reviews,
      averageRating:
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10
            ) / 10
          : 0,
    }))
    .sort((a, b) => b.feedbackCount - a.feedbackCount);
}
