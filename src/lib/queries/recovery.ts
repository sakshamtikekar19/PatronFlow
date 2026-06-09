import { createClient } from "@/lib/supabase/server";
import type { RecoveryCase, RecoveryAnalytics } from "@/types";

export async function getRecoveryCases(
  restaurantId: string
): Promise<RecoveryCase[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("feedback")
    .select(
      `
      *,
      customer:customers(id, name, phone, email)
    `
    )
    .eq("restaurant_id", restaurantId)
    .lte("rating", 3)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] : item.customer,
  })) as RecoveryCase[];
}

export async function getRecoveryAnalytics(
  restaurantId: string
): Promise<RecoveryAnalytics> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feedback")
    .select("recovery_status")
    .eq("restaurant_id", restaurantId)
    .lte("rating", 3);

  const rows = data ?? [];
  const totalNegative = rows.length;
  const recovered = rows.filter((r) => r.recovery_status === "resolved").length;
  const contacted = rows.filter((r) => r.recovery_status === "contacted").length;
  const openCases = rows.filter((r) => r.recovery_status === "pending").length;

  return {
    totalNegative,
    recovered,
    contacted,
    openCases,
    recoveryRate:
      totalNegative > 0 ? Math.round((recovered / totalNegative) * 100) : 0,
  };
}
