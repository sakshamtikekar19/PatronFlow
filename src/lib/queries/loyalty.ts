import { createClient } from "@/lib/supabase/server";
import type {
  LoyaltyRule,
  LoyaltyStats,
  LoyaltyCustomer,
  CustomerLoyaltySummary,
  Customer,
} from "@/types";

interface PointTotals {
  earned: number;
  redeemed: number;
  adjusted: number;
}

function emptyTotals(): PointTotals {
  return { earned: 0, redeemed: 0, adjusted: 0 };
}

function balanceOf(t: PointTotals): number {
  return t.earned - t.redeemed + t.adjusted;
}

async function getPointTotalsByCustomer(
  restaurantId: string
): Promise<Map<string, PointTotals>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loyalty_transactions")
    .select("customer_id, points, transaction_type")
    .eq("restaurant_id", restaurantId);

  const map = new Map<string, PointTotals>();
  (data ?? []).forEach((t) => {
    const totals = map.get(t.customer_id) ?? emptyTotals();
    if (t.transaction_type === "earned") totals.earned += t.points;
    else if (t.transaction_type === "redeemed") totals.redeemed += t.points;
    else totals.adjusted += t.points;
    map.set(t.customer_id, totals);
  });

  return map;
}

export async function getLoyaltyRules(
  restaurantId: string
): Promise<LoyaltyRule[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("loyalty_rules")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("points_required", { ascending: true });
  return data ?? [];
}

export async function getLoyaltyStats(
  restaurantId: string
): Promise<LoyaltyStats> {
  const totalsByCustomer = await getPointTotalsByCustomer(restaurantId);
  const rules = await getLoyaltyRules(restaurantId);

  let pointsIssued = 0;
  let pointsRedeemed = 0;
  let outstandingPoints = 0;
  let activeMembers = 0;

  for (const totals of totalsByCustomer.values()) {
    pointsIssued += totals.earned;
    pointsRedeemed += totals.redeemed;
    outstandingPoints += balanceOf(totals);
    if (balanceOf(totals) > 0 || totals.earned > 0) activeMembers += 1;
  }

  return {
    activeMembers,
    pointsIssued,
    pointsRedeemed,
    outstandingPoints,
    rewardCount: rules.length,
  };
}

export async function getLoyaltyCustomers(
  restaurantId: string
): Promise<LoyaltyCustomer[]> {
  const supabase = await createClient();

  const { data: customers } = await supabase
    .from("customers")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("name", { ascending: true });

  const totalsByCustomer = await getPointTotalsByCustomer(restaurantId);

  return (customers ?? [])
    .map((c: Customer) => {
      const totals = totalsByCustomer.get(c.id) ?? emptyTotals();
      return {
        ...c,
        totalPoints: balanceOf(totals),
        pointsEarned: totals.earned,
        pointsRedeemed: totals.redeemed,
      };
    })
    .sort(
      (a, b) =>
        b.totalPoints - a.totalPoints || a.name.localeCompare(b.name)
    );
}

export async function getCustomerLoyaltySummary(
  restaurantId: string,
  customerId: string
): Promise<CustomerLoyaltySummary> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("loyalty_transactions")
    .select("points, transaction_type")
    .eq("restaurant_id", restaurantId)
    .eq("customer_id", customerId);

  const totals = emptyTotals();
  (data ?? []).forEach((t) => {
    if (t.transaction_type === "earned") totals.earned += t.points;
    else if (t.transaction_type === "redeemed") totals.redeemed += t.points;
    else totals.adjusted += t.points;
  });

  const totalPoints = balanceOf(totals);
  const rules = await getLoyaltyRules(restaurantId);

  return {
    totalPoints,
    pointsEarned: totals.earned,
    pointsRedeemed: totals.redeemed,
    eligibleRewards: rules
      .filter((r) => totalPoints >= r.points_required)
      .map((r) => ({
        id: r.id,
        reward_name: r.reward_name,
        points_required: r.points_required,
      })),
  };
}
