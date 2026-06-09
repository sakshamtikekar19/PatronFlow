import { createClient } from "@/lib/supabase/server";
import type { FeedbackCategory, FeedbackWithCustomer } from "@/types";

export interface FeedbackFilters {
  rating?: number;
  category?: FeedbackCategory;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function getAllFeedback(
  restaurantId: string,
  filters?: FeedbackFilters
): Promise<FeedbackWithCustomer[]> {
  const supabase = await createClient();

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

  if (filters?.rating) {
    query = query.eq("rating", filters.rating);
  }

  if (filters?.category) {
    query = query.eq("category", filters.category);
  }

  if (filters?.dateFrom) {
    query = query.gte("created_at", filters.dateFrom);
  }

  if (filters?.dateTo) {
    query = query.lte("created_at", filters.dateTo);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  let results = data.map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] : item.customer,
  })) as FeedbackWithCustomer[];

  if (filters?.search) {
    const term = filters.search.toLowerCase();
    results = results.filter(
      (f) =>
        f.customer?.name?.toLowerCase().includes(term) ||
        f.customer?.phone?.includes(term) ||
        f.comment?.toLowerCase().includes(term)
    );
  }

  return results;
}
