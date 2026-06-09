import { createClient } from "@/lib/supabase/server";
import type {
  FeedbackCategory,
  RestaurantInsights,
  ReviewFunnel,
  TrendComparison,
} from "@/types";

function changePercent(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export async function getRestaurantInsights(
  restaurantId: string
): Promise<RestaurantInsights> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feedback")
    .select("rating, category, created_at")
    .eq("restaurant_id", restaurantId);

  const rows = data ?? [];

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

  // Highest / lowest rated category (require at least 1 rating)
  let highest: { category: FeedbackCategory; average: number } | null = null;
  let lowest: { category: FeedbackCategory; average: number } | null = null;
  for (const [category, ratings] of categoryRatings.entries()) {
    const avg =
      Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
      10;
    if (!highest || avg > highest.average) highest = { category, average: avg };
    if (!lowest || avg < lowest.average) lowest = { category, average: avg };
  }

  // Weekly / monthly comparisons
  const now = Date.now();
  const day = 1000 * 60 * 60 * 24;

  const countBetween = (startAgo: number, endAgo: number) =>
    rows.filter((f) => {
      const t = new Date(f.created_at).getTime();
      return t >= now - startAgo * day && t < now - endAgo * day;
    }).length;

  const weeklyCurrent = countBetween(7, 0);
  const weeklyPrevious = countBetween(14, 7);
  const monthlyCurrent = countBetween(30, 0);
  const monthlyPrevious = countBetween(60, 30);

  const weeklyFeedback: TrendComparison = {
    current: weeklyCurrent,
    previous: weeklyPrevious,
    changePercent: changePercent(weeklyCurrent, weeklyPrevious),
  };
  const monthlyFeedback: TrendComparison = {
    current: monthlyCurrent,
    previous: monthlyPrevious,
    changePercent: changePercent(monthlyCurrent, monthlyPrevious),
  };

  return {
    mostCommonComplaint: topOf(negativeCounts),
    mostMentionedPositive: topOf(positiveCounts),
    highestRatedCategory: highest,
    lowestRatedCategory: lowest,
    weeklyFeedback,
    monthlyFeedback,
  };
}

export async function getReviewFunnel(
  restaurantId: string
): Promise<ReviewFunnel> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feedback")
    .select("rating, review_clicked")
    .eq("restaurant_id", restaurantId);

  const rows = data ?? [];
  const totalFeedback = rows.length;
  const positiveFeedback = rows.filter((f) => f.rating >= 4).length;
  const negativeFeedback = rows.filter((f) => f.rating <= 3).length;
  const reviewClicks = rows.filter((f) => f.review_clicked).length;

  return {
    totalFeedback,
    positiveFeedback,
    negativeFeedback,
    reviewClicks,
    positivePercent:
      totalFeedback > 0
        ? Math.round((positiveFeedback / totalFeedback) * 100)
        : 0,
    negativePercent:
      totalFeedback > 0
        ? Math.round((negativeFeedback / totalFeedback) * 100)
        : 0,
    conversionRate:
      positiveFeedback > 0
        ? Math.round((reviewClicks / positiveFeedback) * 100)
        : 0,
  };
}
