import { createAdminClient } from "@/lib/supabase/admin";
import { BILLING_CONFIG } from "@/lib/billing/config";
import { isSubscriptionActive } from "@/lib/billing/subscription-access";
import type { Subscription } from "@/types/database.types";

export interface GrowthPoint {
  date: string;
  count: number;
}

export interface AdminOverviewStats {
  totalRestaurants: number;
  activeRestaurants: number;
  totalFeedback: number;
  totalCustomers: number;
  totalReviewClicks: number;
  totalEvents: number;
  growth: {
    restaurants: number;
    activeRestaurants: number;
    feedback: number;
    customers: number;
    reviewClicks: number;
    events: number;
  };
}

export interface AdminRestaurantListItem {
  id: string;
  name: string;
  slug: string | null;
  ownerId: string;
  ownerEmail: string | null;
  onboarded: boolean;
  isSuspended: boolean;
  createdAt: string;
  lastActiveAt: string | null;
  healthScore: number;
  subscriptionStatus: string | null;
  feedbackCount: number;
  customerCount: number;
}

export interface AdminRestaurantDetail extends AdminRestaurantListItem {
  googleReviewUrl: string | null;
  cuisineType: string | null;
  suspendedAt: string | null;
  suspendedReason: string | null;
  eventCount: number;
  reviewClickCount: number;
  trialEndsAt: string | null;
}

export interface AdminRevenueStats {
  mrr: number;
  arr: number;
  activeSubscriptions: number;
  trialUsers: number;
  churnRate: number;
  cancelledLast30Days: number;
}

export interface SupportRequestRow {
  id: string;
  type: "contact" | "bug" | "feature";
  status: "open" | "in_progress" | "resolved" | "closed";
  name: string;
  email: string;
  subject: string;
  message: string;
  adminNotes: string | null;
  restaurantId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogRow {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function growthPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function countInRange(
  rows: { created_at: string }[],
  start: string,
  end?: string
): number {
  return rows.filter((row) => {
    const created = row.created_at;
    if (created < start) return false;
    if (end && created >= end) return false;
    return true;
  }).length;
}

export function buildDailyGrowthSeries(
  rows: { created_at: string }[],
  days = 30
): GrowthPoint[] {
  const map = new Map<string, number>();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    map.set(date.toISOString().slice(0, 10), 0);
  }

  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    if (map.has(day)) {
      map.set(day, (map.get(day) ?? 0) + 1);
    }
  }

  return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
}

export function buildCumulativeGrowthSeries(
  rows: { created_at: string }[],
  days = 30
): GrowthPoint[] {
  const daily = buildDailyGrowthSeries(rows, days);
  let running = 0;

  const beforeWindow = rows.filter((row) => {
    const firstDay = daily[0]?.date;
    return firstDay ? row.created_at.slice(0, 10) < firstDay : false;
  }).length;

  running = beforeWindow;

  return daily.map((point) => {
    running += point.count;
    return { date: point.date, count: running };
  });
}

export function computeHealthScore(input: {
  onboarded: boolean;
  isActive: boolean;
  customerCount: number;
  feedbackCount30d: number;
  lastActiveAt: string | null;
}): number {
  let score = 0;
  if (input.onboarded) score += 25;
  if (input.isActive) score += 25;
  if (input.customerCount > 0) score += 20;
  if (input.feedbackCount30d > 0) score += 20;
  if (input.lastActiveAt) {
    const daysSince =
      (Date.now() - new Date(input.lastActiveAt).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSince < 14) score += 10;
  }
  return Math.min(100, score);
}

async function getOwnerEmailMap(): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const map = new Map<string, string>();
  let page = 1;

  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || !data.users.length) break;
    for (const user of data.users) {
      if (user.id && user.email) map.set(user.id, user.email);
    }
    if (data.users.length < 200) break;
    page += 1;
  }

  return map;
}

export async function getAdminOverview(): Promise<AdminOverviewStats> {
  const admin = createAdminClient();
  const thirtyDaysAgo = daysAgoIso(30);
  const sixtyDaysAgo = daysAgoIso(60);

  const [restaurantsRes, feedbackRes, customersRes, eventsRes, subscriptionsRes] =
    await Promise.all([
      admin.from("restaurants").select("id, created_at, is_suspended"),
      admin.from("feedback").select("id, created_at, review_clicked"),
      admin.from("customers").select("id, created_at"),
      admin.from("events").select("id, created_at"),
      admin.from("subscriptions").select("*"),
    ]);

  const restaurants = restaurantsRes.data ?? [];
  const feedback = feedbackRes.data ?? [];
  const customers = customersRes.data ?? [];
  const events = eventsRes.data ?? [];
  const subscriptions = (subscriptionsRes.data ?? []) as Subscription[];

  const activeIds = new Set(
    subscriptions
      .filter((sub) => isSubscriptionActive(sub))
      .map((sub) => sub.restaurant_id)
  );

  const activeRestaurants = restaurants.filter(
    (r) => activeIds.has(r.id) && !r.is_suspended
  ).length;

  const reviewClicks = feedback.filter((f) => f.review_clicked).length;
  const reviewClicksLast30 = feedback.filter(
    (f) => f.review_clicked && f.created_at >= thirtyDaysAgo
  ).length;
  const reviewClicksPrev30 = feedback.filter(
    (f) =>
      f.review_clicked &&
      f.created_at >= sixtyDaysAgo &&
      f.created_at < thirtyDaysAgo
  ).length;

  const restaurantsLast30 = countInRange(restaurants, thirtyDaysAgo);
  const restaurantsPrev30 = countInRange(
    restaurants,
    sixtyDaysAgo,
    thirtyDaysAgo
  );

  const activeLast30 = restaurants.filter(
    (r) =>
      !r.is_suspended &&
      activeIds.has(r.id) &&
      r.created_at >= thirtyDaysAgo
  ).length;
  const activePrev30 = restaurants.filter(
    (r) =>
      !r.is_suspended &&
      activeIds.has(r.id) &&
      r.created_at >= sixtyDaysAgo &&
      r.created_at < thirtyDaysAgo
  ).length;

  return {
    totalRestaurants: restaurants.length,
    activeRestaurants,
    totalFeedback: feedback.length,
    totalCustomers: customers.length,
    totalReviewClicks: reviewClicks,
    totalEvents: events.length,
    growth: {
      restaurants: growthPct(restaurantsLast30, restaurantsPrev30),
      activeRestaurants: growthPct(activeLast30, activePrev30),
      feedback: growthPct(
        countInRange(feedback, thirtyDaysAgo),
        countInRange(feedback, sixtyDaysAgo, thirtyDaysAgo)
      ),
      customers: growthPct(
        countInRange(customers, thirtyDaysAgo),
        countInRange(customers, sixtyDaysAgo, thirtyDaysAgo)
      ),
      reviewClicks: growthPct(reviewClicksLast30, reviewClicksPrev30),
      events: growthPct(
        countInRange(events, thirtyDaysAgo),
        countInRange(events, sixtyDaysAgo, thirtyDaysAgo)
      ),
    },
  };
}

export async function getAdminAnalytics() {
  const admin = createAdminClient();
  const thirtyDaysAgo = daysAgoIso(30);

  const [restaurantsRes, feedbackRes, customersRes, eventsRes] =
    await Promise.all([
      admin
        .from("restaurants")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo),
      admin
        .from("feedback")
        .select("created_at, review_clicked")
        .gte("created_at", thirtyDaysAgo),
      admin
        .from("customers")
        .select("created_at")
        .gte("created_at", thirtyDaysAgo),
      admin.from("events").select("created_at").gte("created_at", thirtyDaysAgo),
    ]);

  const restaurants = restaurantsRes.data ?? [];
  const feedback = feedbackRes.data ?? [];
  const customers = customersRes.data ?? [];
  const reviewClicks = feedback.filter((f) => f.review_clicked);

  return {
    restaurantGrowth: buildCumulativeGrowthSeries(restaurants),
    feedbackGrowth: buildDailyGrowthSeries(feedback),
    customerGrowth: buildCumulativeGrowthSeries(customers),
    reviewClickGrowth: buildDailyGrowthSeries(reviewClicks),
    eventGrowth: buildDailyGrowthSeries(eventsRes.data ?? []),
  };
}

export async function getAdminRevenue(): Promise<AdminRevenueStats> {
  const admin = createAdminClient();
  const thirtyDaysAgo = daysAgoIso(30);

  const { data: subscriptions } = await admin.from("subscriptions").select("*");
  const subs = (subscriptions ?? []) as Subscription[];

  const monthlyPrice = BILLING_CONFIG.plans[0].priceINR / 100;
  const activeSubscriptions = subs.filter(
    (sub) => sub.status === "active"
  ).length;
  const trialUsers = subs.filter((sub) => sub.status === "trialing").length;
  const cancelledLast30Days = subs.filter(
    (sub) =>
      sub.status === "cancelled" &&
      sub.cancelled_at &&
      sub.cancelled_at >= thirtyDaysAgo
  ).length;

  const activeAtStart = subs.filter((sub) => {
    if (sub.status !== "active" && sub.status !== "cancelled") return false;
    return sub.created_at < thirtyDaysAgo;
  }).length;

  const churnRate =
    activeAtStart > 0
      ? Math.round((cancelledLast30Days / activeAtStart) * 100)
      : 0;

  const mrr = activeSubscriptions * monthlyPrice;

  return {
    mrr,
    arr: mrr * 12,
    activeSubscriptions,
    trialUsers,
    churnRate,
    cancelledLast30Days,
  };
}

export async function getAdminRestaurants(
  search?: string
): Promise<AdminRestaurantListItem[]> {
  const admin = createAdminClient();
  const thirtyDaysAgo = daysAgoIso(30);

  let query = admin
    .from("restaurants")
    .select("*")
    .order("created_at", { ascending: false });

  if (search?.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data: restaurants } = await query;
  if (!restaurants?.length) return [];

  const restaurantIds = restaurants.map((r) => r.id);

  const [subscriptionsRes, feedbackRes, customersRes, ownerEmails] =
    await Promise.all([
      admin
        .from("subscriptions")
        .select("*")
        .in("restaurant_id", restaurantIds),
      admin
        .from("feedback")
        .select("restaurant_id, created_at")
        .in("restaurant_id", restaurantIds),
      admin
        .from("customers")
        .select("restaurant_id")
        .in("restaurant_id", restaurantIds),
      getOwnerEmailMap(),
    ]);

  const subsByRestaurant = new Map(
    (subscriptionsRes.data ?? []).map((sub) => [sub.restaurant_id, sub])
  );

  const feedbackByRestaurant = new Map<string, { total: number; last30: number }>();
  for (const row of feedbackRes.data ?? []) {
    const current = feedbackByRestaurant.get(row.restaurant_id) ?? {
      total: 0,
      last30: 0,
    };
    current.total += 1;
    if (row.created_at >= thirtyDaysAgo) current.last30 += 1;
    feedbackByRestaurant.set(row.restaurant_id, current);
  }

  const customersByRestaurant = new Map<string, number>();
  for (const row of customersRes.data ?? []) {
    customersByRestaurant.set(
      row.restaurant_id,
      (customersByRestaurant.get(row.restaurant_id) ?? 0) + 1
    );
  }

  return restaurants.map((restaurant) => {
    const subscription = subsByRestaurant.get(restaurant.id) as
      | Subscription
      | undefined;
    const isActive = subscription ? isSubscriptionActive(subscription) : false;
    const feedback = feedbackByRestaurant.get(restaurant.id) ?? {
      total: 0,
      last30: 0,
    };
    const customerCount = customersByRestaurant.get(restaurant.id) ?? 0;

    return {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      ownerId: restaurant.owner_id,
      ownerEmail: ownerEmails.get(restaurant.owner_id) ?? null,
      onboarded: restaurant.onboarded,
      isSuspended: Boolean(restaurant.is_suspended),
      createdAt: restaurant.created_at,
      lastActiveAt: restaurant.last_active_at ?? null,
      healthScore: computeHealthScore({
        onboarded: restaurant.onboarded,
        isActive: isActive && !restaurant.is_suspended,
        customerCount,
        feedbackCount30d: feedback.last30,
        lastActiveAt: restaurant.last_active_at ?? null,
      }),
      subscriptionStatus: subscription?.status ?? null,
      feedbackCount: feedback.total,
      customerCount,
    };
  });
}

export async function getAdminRestaurantDetail(
  restaurantId: string
): Promise<AdminRestaurantDetail | null> {
  const admin = createAdminClient();
  const thirtyDaysAgo = daysAgoIso(30);

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("*")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) return null;

  const [subscriptionRes, feedbackRes, customersRes, eventsRes, ownerEmails] =
    await Promise.all([
      admin
        .from("subscriptions")
        .select("*")
        .eq("restaurant_id", restaurantId)
        .maybeSingle(),
      admin
        .from("feedback")
        .select("created_at, review_clicked")
        .eq("restaurant_id", restaurantId),
      admin.from("customers").select("id").eq("restaurant_id", restaurantId),
      admin.from("events").select("id").eq("restaurant_id", restaurantId),
      getOwnerEmailMap(),
    ]);

  const subscription = subscriptionRes.data as Subscription | null;
  const feedback = feedbackRes.data ?? [];
  const isActive = subscription ? isSubscriptionActive(subscription) : false;
  const feedback30d = feedback.filter((f) => f.created_at >= thirtyDaysAgo).length;
  const customerCount = customersRes.data?.length ?? 0;
  const reviewClickCount = feedback.filter((f) => f.review_clicked).length;

  return {
    id: restaurant.id,
    name: restaurant.name,
    slug: restaurant.slug,
    ownerId: restaurant.owner_id,
    ownerEmail: ownerEmails.get(restaurant.owner_id) ?? null,
    onboarded: restaurant.onboarded,
    isSuspended: Boolean(restaurant.is_suspended),
    createdAt: restaurant.created_at,
    lastActiveAt: restaurant.last_active_at ?? null,
    googleReviewUrl: restaurant.google_review_url,
    cuisineType: restaurant.cuisine_type,
    suspendedAt: restaurant.suspended_at ?? null,
    suspendedReason: restaurant.suspended_reason ?? null,
    healthScore: computeHealthScore({
      onboarded: restaurant.onboarded,
      isActive: isActive && !restaurant.is_suspended,
      customerCount,
      feedbackCount30d: feedback30d,
      lastActiveAt: restaurant.last_active_at ?? null,
    }),
    subscriptionStatus: subscription?.status ?? null,
    feedbackCount: feedback.length,
    customerCount,
    eventCount: eventsRes.data?.length ?? 0,
    reviewClickCount,
    trialEndsAt: subscription?.trial_ends_at ?? null,
  };
}

export async function getSupportRequests(): Promise<SupportRequestRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("support_requests")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((row) => ({
    id: row.id,
    type: row.type,
    status: row.status,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    adminNotes: row.admin_notes,
    restaurantId: row.restaurant_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getAuditLogs(): Promise<AuditLogRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  return (data ?? []).map((row) => ({
    id: row.id,
    actorId: row.actor_id,
    actorEmail: row.actor_email,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    metadata: (row.metadata as Record<string, unknown>) ?? {},
    createdAt: row.created_at,
  }));
}
