import { createClient } from "@/lib/supabase/server";
import { getCustomersWithStats } from "@/lib/queries/customers";
import { classifyCustomer } from "@/lib/segments";
import type { NotificationItem } from "@/types";

const LOOKBACK_DAYS = 30;
const MAX_NOTIFICATIONS = 30;

/**
 * Derives a notification feed from recent activity (last 30 days):
 * - New negative feedback (rating <= 3)
 * - New customers added
 * - VIP customers identified (5+ visits)
 */
export async function getNotifications(
  restaurantId: string
): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const since = new Date(
    Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const items: NotificationItem[] = [];

  // Negative feedback
  const { data: negative } = await supabase
    .from("feedback")
    .select("id, rating, comment, created_at, customer:customers(name)")
    .eq("restaurant_id", restaurantId)
    .lte("rating", 3)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(MAX_NOTIFICATIONS);

  (negative ?? []).forEach((f) => {
    const customer = Array.isArray(f.customer) ? f.customer[0] : f.customer;
    items.push({
      id: `neg-${f.id}`,
      type: "negative_feedback",
      title: "New negative feedback",
      description: `${customer?.name ?? "A guest"} left a ${f.rating}-star review`,
      createdAt: f.created_at,
    });
  });

  // New customers
  const { data: newCustomers } = await supabase
    .from("customers")
    .select("id, name, created_at")
    .eq("restaurant_id", restaurantId)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(MAX_NOTIFICATIONS);

  (newCustomers ?? []).forEach((c) => {
    items.push({
      id: `cust-${c.id}`,
      type: "new_customer",
      title: "New customer added",
      description: `${c.name} joined your customer list`,
      createdAt: c.created_at,
    });
  });

  // Birthdays today: match on month + day regardless of birth year.
  const { data: birthdayCustomers } = await supabase
    .from("customers")
    .select("id, name, birthday")
    .eq("restaurant_id", restaurantId)
    .not("birthday", "is", null);

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();
  const startOfToday = new Date(
    today.getFullYear(),
    todayMonth,
    todayDate
  ).toISOString();

  (birthdayCustomers ?? []).forEach((c) => {
    if (!c.birthday) return;
    const [, m, d] = c.birthday.split("-").map(Number);
    if (m - 1 === todayMonth && d === todayDate) {
      items.push({
        id: `bday-${c.id}`,
        type: "birthday",
        title: "Customer birthday today 🎂",
        description: `It's ${c.name}'s birthday today — reach out!`,
        createdAt: startOfToday,
      });
    }
  });

  // VIP identified (5+ visits, last visit within lookback)
  const customersWithStats = await getCustomersWithStats(restaurantId);
  customersWithStats
    .filter(
      (c) =>
        classifyCustomer(c) === "VIP" &&
        c.last_visit &&
        c.last_visit >= since
    )
    .forEach((c) => {
      items.push({
        id: `vip-${c.id}`,
        type: "vip",
        title: "VIP customer identified",
        description: `${c.name} reached ${c.visits} visits`,
        createdAt: c.last_visit!,
      });
    });

  return items
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, MAX_NOTIFICATIONS);
}
