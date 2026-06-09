import { createClient } from "@/lib/supabase/server";
import type { CustomerInsights, FeedbackCategory } from "@/types";

const MIN_TABLE_FEEDBACK = 2;

export async function getCustomerInsights(
  restaurantId: string
): Promise<CustomerInsights> {
  const supabase = await createClient();

  const { data: feedback } = await supabase
    .from("feedback")
    .select("rating, category, table_name")
    .eq("restaurant_id", restaurantId);

  const rows = feedback ?? [];

  // Category aggregation
  const positiveCounts = new Map<FeedbackCategory, number>();
  const negativeCounts = new Map<FeedbackCategory, number>();
  const categoryRatings = new Map<FeedbackCategory, number[]>();

  rows.forEach((f) => {
    const cat = f.category as FeedbackCategory;
    if (!categoryRatings.has(cat)) categoryRatings.set(cat, []);
    categoryRatings.get(cat)!.push(f.rating);
    if (f.rating >= 4) {
      positiveCounts.set(cat, (positiveCounts.get(cat) ?? 0) + 1);
    } else if (f.rating <= 3) {
      negativeCounts.set(cat, (negativeCounts.get(cat) ?? 0) + 1);
    }
  });

  const topOf = (map: Map<FeedbackCategory, number>) => {
    let best: { category: FeedbackCategory; count: number } | null = null;
    for (const [category, count] of map.entries()) {
      if (!best || count > best.count) best = { category, count };
    }
    return best;
  };

  let highest: { category: FeedbackCategory; average: number } | null = null;
  let lowest: { category: FeedbackCategory; average: number } | null = null;
  for (const [category, ratings] of categoryRatings.entries()) {
    const avg =
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
      10;
    if (!highest || avg > highest.average) highest = { category, average: avg };
    if (!lowest || avg < lowest.average) lowest = { category, average: avg };
  }

  // Table performance
  const tableRatings = new Map<string, number[]>();
  rows.forEach((f) => {
    if (!f.table_name) return;
    if (!tableRatings.has(f.table_name)) tableRatings.set(f.table_name, []);
    tableRatings.get(f.table_name)!.push(f.rating);
  });

  let bestTable: { tableName: string; average: number; count: number } | null =
    null;
  let worstTable: { tableName: string; average: number; count: number } | null =
    null;
  for (const [tableName, ratings] of tableRatings.entries()) {
    if (ratings.length < MIN_TABLE_FEEDBACK) continue;
    const avg =
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
      10;
    const entry = { tableName, average: avg, count: ratings.length };
    if (!bestTable || avg > bestTable.average) bestTable = entry;
    if (!worstTable || avg < worstTable.average) worstTable = entry;
  }

  // Most active customer (by recorded visits, falling back to feedback)
  const { data: visits } = await supabase
    .from("customer_visits")
    .select("customer_id")
    .eq("restaurant_id", restaurantId);

  const visitCounts = new Map<string, number>();
  (visits ?? []).forEach((v) => {
    visitCounts.set(v.customer_id, (visitCounts.get(v.customer_id) ?? 0) + 1);
  });

  let topCustomerId: string | null = null;
  let topCustomerVisits = 0;
  for (const [id, count] of visitCounts.entries()) {
    if (count > topCustomerVisits) {
      topCustomerVisits = count;
      topCustomerId = id;
    }
  }

  let mostActiveCustomer:
    | { id: string; name: string; visits: number }
    | null = null;
  if (topCustomerId) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id, name")
      .eq("id", topCustomerId)
      .maybeSingle();
    if (customer) {
      mostActiveCustomer = {
        id: customer.id,
        name: customer.name,
        visits: topCustomerVisits,
      };
    }
  }

  return {
    mostCommonComplaint: topOf(negativeCounts),
    mostLovedCategory: topOf(positiveCounts),
    highestRatedCategory: highest,
    lowestRatedCategory: lowest,
    bestPerformingTable: bestTable,
    worstPerformingTable: worstTable,
    mostActiveCustomer,
  };
}
