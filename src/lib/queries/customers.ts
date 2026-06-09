import { createClient } from "@/lib/supabase/server";
import type { CustomerWithStats, FeedbackWithCustomer } from "@/types";

export async function getCustomersWithStats(
  restaurantId: string,
  search?: string
): Promise<CustomerWithStats[]> {
  const supabase = await createClient();

  const { data: customers, error } = await supabase
    .from("customers")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  if (error || !customers) return [];

  const { data: feedback } = await supabase
    .from("feedback")
    .select("customer_id, rating, created_at")
    .eq("restaurant_id", restaurantId);

  const feedbackByCustomer = new Map<
    string,
    { ratings: number[]; lastVisit: string | null }
  >();

  (feedback ?? []).forEach((f) => {
    const existing = feedbackByCustomer.get(f.customer_id) ?? {
      ratings: [],
      lastVisit: null,
    };
    existing.ratings.push(f.rating);
    if (!existing.lastVisit || f.created_at > existing.lastVisit) {
      existing.lastVisit = f.created_at;
    }
    feedbackByCustomer.set(f.customer_id, existing);
  });

  let results: CustomerWithStats[] = customers.map((customer) => {
    const stats = feedbackByCustomer.get(customer.id);
    const visits = stats?.ratings.length ?? 0;
    const average_rating =
      visits > 0
        ? Math.round(
            (stats!.ratings.reduce((a, b) => a + b, 0) / visits) * 10
          ) / 10
        : 0;

    return {
      ...customer,
      visits,
      average_rating,
      last_visit: stats?.lastVisit ?? null,
    };
  });

  if (search) {
    const term = search.toLowerCase();
    results = results.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.phone.includes(term) ||
        c.email?.toLowerCase().includes(term)
    );
  }

  return results;
}

export async function getCustomerFeedback(
  customerId: string
): Promise<FeedbackWithCustomer[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      customer:customers(id, name, phone, email)
    `
    )
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] : item.customer,
  })) as FeedbackWithCustomer[];
}
