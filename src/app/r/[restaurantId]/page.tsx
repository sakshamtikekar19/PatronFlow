import { redirect, notFound } from "next/navigation";
import { getRestaurantBySlugOrId } from "@/lib/queries/restaurant";

interface LegacyReviewRedirectProps {
  params: Promise<{ restaurantId: string }>;
  searchParams: Promise<{ table?: string; source?: string }>;
}

/**
 * Legacy ID-based review URL (/r/[id]). Kept only so previously printed QR
 * codes keep working — it 301-style redirects to the canonical, SEO-friendly
 * slug URL (/review/[slug]).
 */
export default async function LegacyReviewRedirect({
  params,
  searchParams,
}: LegacyReviewRedirectProps) {
  const { restaurantId } = await params;
  const { table, source } = await searchParams;

  const restaurant = await getRestaurantBySlugOrId(restaurantId);
  if (!restaurant) {
    notFound();
  }

  const qs = new URLSearchParams();
  if (table) qs.set("table", table);
  if (source) qs.set("source", source);
  const suffix = qs.toString() ? `?${qs.toString()}` : "";

  redirect(`/review/${restaurant.slug ?? restaurant.id}${suffix}`);
}
