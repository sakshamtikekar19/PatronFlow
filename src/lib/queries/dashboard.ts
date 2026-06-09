import { createClient } from "@/lib/supabase/server";
import type {
  DashboardStats,
  FeedbackTrend,
  FeedbackWithCustomer,
  RatingDistribution,
} from "@/types";
import { format, subDays, startOfDay } from "date-fns";

export async function getDashboardStats(
  restaurantId: string
): Promise<DashboardStats> {
  const supabase = await createClient();

  const [feedbackRes, customersRes] = await Promise.all([
    supabase
      .from("feedback")
      .select("rating")
      .eq("restaurant_id", restaurantId),
    supabase
      .from("customers")
      .select("id", { count: "exact", head: true })
      .eq("restaurant_id", restaurantId),
  ]);

  const feedback = feedbackRes.data ?? [];
  const totalFeedback = feedback.length;
  const totalCustomers = customersRes.count ?? 0;

  const averageRating =
    totalFeedback > 0
      ? Math.round(
          (feedback.reduce((sum, f) => sum + f.rating, 0) / totalFeedback) * 10
        ) / 10
      : 0;

  const positiveCount = feedback.filter((f) => f.rating >= 4).length;
  const positiveFeedbackPercent =
    totalFeedback > 0 ? Math.round((positiveCount / totalFeedback) * 100) : 0;

  return {
    averageRating,
    totalFeedback,
    totalCustomers,
    positiveFeedbackPercent,
  };
}

export async function getRecentFeedback(
  restaurantId: string,
  search?: string,
  limit = 10
): Promise<FeedbackWithCustomer[]> {
  const supabase = await createClient();

  const term = search?.trim();

  let query = supabase
    .from("feedback")
    .select(
      `
      *,
      customer:customers(id, name, phone, email)
    `
    )
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  // When searching, match across ALL feedback (comment) and any customer whose
  // name/phone matches, instead of filtering only the most recent rows.
  if (term) {
    const pattern = `%${term}%`;

    const { data: matchedCustomers } = await supabase
      .from("customers")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .or(`name.ilike.${pattern},phone.ilike.${pattern}`);

    const customerIds = (matchedCustomers ?? []).map((c) => c.id);

    const orFilters = [`comment.ilike.${pattern}`];
    if (customerIds.length > 0) {
      orFilters.push(`customer_id.in.(${customerIds.join(",")})`);
    }

    query = query.or(orFilters.join(","));
  }

  const { data, error } = await query.limit(limit);

  if (error || !data) return [];

  return data.map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] : item.customer,
  })) as FeedbackWithCustomer[];
}

export async function getFeedbackTrend(
  restaurantId: string,
  days = 30
): Promise<FeedbackTrend[]> {
  const supabase = await createClient();
  const startDate = startOfDay(subDays(new Date(), days));

  const { data, error } = await supabase
    .from("feedback")
    .select("created_at")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", startDate.toISOString());

  if (error || !data) return [];

  const trendMap = new Map<string, number>();

  for (let i = days; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "MMM d");
    trendMap.set(date, 0);
  }

  data.forEach((item) => {
    const date = format(new Date(item.created_at), "MMM d");
    if (trendMap.has(date)) {
      trendMap.set(date, (trendMap.get(date) ?? 0) + 1);
    }
  });

  return Array.from(trendMap.entries()).map(([date, count]) => ({
    date,
    count,
  }));
}

export async function getRatingDistribution(
  restaurantId: string
): Promise<RatingDistribution[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feedback")
    .select("rating")
    .eq("restaurant_id", restaurantId);

  if (error || !data) {
    return [1, 2, 3, 4, 5].map((r) => ({
      rating: r,
      count: 0,
      label: `${r} Star`,
    }));
  }

  const counts = [0, 0, 0, 0, 0];
  data.forEach((item) => {
    if (item.rating >= 1 && item.rating <= 5) {
      counts[item.rating - 1]++;
    }
  });

  return counts.map((count, index) => ({
    rating: index + 1,
    count,
    label: `${index + 1} Star`,
  }));
}
