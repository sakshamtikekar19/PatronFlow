import { createClient } from "@/lib/supabase/server";
import type { VisitMetrics } from "@/types";

export async function getVisitMetrics(
  restaurantId: string
): Promise<VisitMetrics> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("customer_visits")
    .select("customer_id")
    .eq("restaurant_id", restaurantId);

  const rows = data ?? [];
  const totalVisits = rows.length;

  const visitsByCustomer = new Map<string, number>();
  rows.forEach((v) => {
    visitsByCustomer.set(
      v.customer_id,
      (visitsByCustomer.get(v.customer_id) ?? 0) + 1
    );
  });

  const uniqueCustomers = visitsByCustomer.size;
  let repeatCustomers = 0;
  for (const count of visitsByCustomer.values()) {
    if (count >= 2) repeatCustomers += 1;
  }

  return {
    totalVisits,
    uniqueCustomers,
    repeatCustomers,
    repeatRate:
      uniqueCustomers > 0
        ? Math.round((repeatCustomers / uniqueCustomers) * 100)
        : 0,
    averageVisitsPerCustomer:
      uniqueCustomers > 0
        ? Math.round((totalVisits / uniqueCustomers) * 10) / 10
        : 0,
  };
}

/**
 * Per-customer visit counts and last-visit dates, keyed by customer id.
 * Used to enrich the customer drawer/profile.
 */
export async function getVisitsByCustomer(
  restaurantId: string
): Promise<Map<string, { visits: number; lastVisit: string | null }>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("customer_visits")
    .select("customer_id, visit_date")
    .eq("restaurant_id", restaurantId);

  const map = new Map<string, { visits: number; lastVisit: string | null }>();
  (data ?? []).forEach((v) => {
    const existing = map.get(v.customer_id) ?? { visits: 0, lastVisit: null };
    existing.visits += 1;
    if (!existing.lastVisit || v.visit_date > existing.lastVisit) {
      existing.lastVisit = v.visit_date;
    }
    map.set(v.customer_id, existing);
  });

  return map;
}
