import { createClient } from "@/lib/supabase/server";

export interface SearchSuggestion {
  id: string;
  type: "customer" | "feedback";
  label: string;
  sublabel?: string;
  searchValue: string;
}

export async function searchDashboard(
  restaurantId: string,
  query: string,
  limit = 8
): Promise<SearchSuggestion[]> {
  const term = query.trim();
  if (!term) return [];

  const supabase = await createClient();
  const pattern = `%${term}%`;
  const suggestions: SearchSuggestion[] = [];

  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, phone")
    .eq("restaurant_id", restaurantId)
    .or(`name.ilike.${pattern},phone.ilike.${pattern}`)
    .limit(limit);

  (customers ?? []).forEach((customer) => {
    suggestions.push({
      id: customer.id,
      type: "customer",
      label: customer.name,
      sublabel: customer.phone,
      searchValue: customer.name,
    });
  });

  const remaining = limit - suggestions.length;
  if (remaining > 0) {
    const { data: feedback } = await supabase
      .from("feedback")
      .select(
        `
        id,
        comment,
        rating,
        customer:customers(name, phone)
      `
      )
      .eq("restaurant_id", restaurantId)
      .or(`comment.ilike.${pattern}`)
      .order("created_at", { ascending: false })
      .limit(remaining);

    (feedback ?? []).forEach((item) => {
      const customer = Array.isArray(item.customer)
        ? item.customer[0]
        : item.customer;

      suggestions.push({
        id: item.id,
        type: "feedback",
        label: customer?.name ?? "Unknown customer",
        sublabel:
          item.comment?.slice(0, 60) ||
          `${item.rating} star rating`,
        searchValue: customer?.name ?? term,
      });
    });
  }

  return suggestions.slice(0, limit);
}
