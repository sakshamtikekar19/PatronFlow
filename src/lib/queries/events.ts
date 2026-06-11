import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Event,
  EventRsvp,
  EventWithStats,
  EventAnalytics,
} from "@/types";

async function getRsvpStatsByEvent(
  eventIds: string[]
): Promise<Map<string, { rsvps: number; attended: number }>> {
  const map = new Map<string, { rsvps: number; attended: number }>();
  if (eventIds.length === 0) return map;

  const supabase = await createClient();
  const { data } = await supabase
    .from("event_rsvps")
    .select("event_id, attended")
    .in("event_id", eventIds);

  (data ?? []).forEach((r) => {
    const entry = map.get(r.event_id) ?? { rsvps: 0, attended: 0 };
    entry.rsvps += 1;
    if (r.attended) entry.attended += 1;
    map.set(r.event_id, entry);
  });

  return map;
}

export async function getEvents(
  restaurantId: string
): Promise<EventWithStats[]> {
  const supabase = await createClient();

  const { data: events } = await supabase
    .from("events")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .order("created_at", { ascending: false });

  const rows = (events ?? []) as Event[];
  const statsMap = await getRsvpStatsByEvent(rows.map((e) => e.id));

  return rows.map((e) => {
    const stats = statsMap.get(e.id) ?? { rsvps: 0, attended: 0 };
    return {
      ...e,
      rsvpCount: stats.rsvps,
      attendedCount: stats.attended,
      conversionRate:
        stats.rsvps > 0
          ? Math.round((stats.attended / stats.rsvps) * 100)
          : 0,
    };
  });
}

export async function getEventForOwner(
  restaurantId: string,
  eventId: string
): Promise<Event | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();
  return data ?? null;
}

export async function getEventRsvps(
  eventId: string
): Promise<EventRsvp[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("event_rsvps")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Public, published-only event fetch (bypasses RLS via service role).
 * Resolves by SEO-friendly slug, falling back to an id match for
 * already-shared ID-based links.
 */
export async function getPublicEvent(slugOrId: string): Promise<
  | (Event & { restaurant: { id: string; name: string; logo: string | null } })
  | null
> {
  const supabase = createAdminClient();

  let { data } = await supabase
    .from("events")
    .select("*, restaurant:restaurants(id, name, logo)")
    .eq("slug", slugOrId)
    .maybeSingle();

  if (!data && UUID_RE.test(slugOrId)) {
    ({ data } = await supabase
      .from("events")
      .select("*, restaurant:restaurants(id, name, logo)")
      .eq("id", slugOrId)
      .maybeSingle());
  }

  if (!data) return null;
  if (data.status === "draft") return null;

  return {
    ...data,
    restaurant: Array.isArray(data.restaurant)
      ? data.restaurant[0]
      : data.restaurant,
  } as Event & {
    restaurant: { id: string; name: string; logo: string | null };
  };
}

export async function getUpcomingEvents(
  restaurantId: string,
  limit = 3
): Promise<EventWithStats[]> {
  const events = await getEvents(restaurantId);
  const now = Date.now();
  return events
    .filter(
      (e) =>
        e.status === "published" &&
        (!e.event_date || new Date(e.event_date).getTime() >= now)
    )
    .sort((a, b) => {
      const ta = a.event_date ? new Date(a.event_date).getTime() : Infinity;
      const tb = b.event_date ? new Date(b.event_date).getTime() : Infinity;
      return ta - tb;
    })
    .slice(0, limit);
}

export async function getEventAnalytics(
  restaurantId: string
): Promise<EventAnalytics> {
  const events = await getEvents(restaurantId);

  const totalEvents = events.length;
  const totalRsvps = events.reduce((sum, e) => sum + e.rsvpCount, 0);
  const now = Date.now();
  const upcomingCount = events.filter(
    (e) =>
      e.status === "published" &&
      (!e.event_date || new Date(e.event_date).getTime() >= now)
  ).length;

  let topEvent: { title: string; rsvpCount: number } | null = null;
  for (const e of events) {
    if (!topEvent || e.rsvpCount > topEvent.rsvpCount) {
      topEvent = { title: e.title, rsvpCount: e.rsvpCount };
    }
  }
  if (topEvent && topEvent.rsvpCount === 0) topEvent = null;

  // RSVP growth over the last 6 months
  const supabase = await createClient();
  const eventIds = events.map((e) => e.id);
  const growthMap = new Map<string, number>();
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleString("en-US", { month: "short" });
    months.push(key);
    growthMap.set(key, 0);
  }

  if (eventIds.length > 0) {
    const { data: rsvps } = await supabase
      .from("event_rsvps")
      .select("created_at")
      .in("event_id", eventIds);
    (rsvps ?? []).forEach((r) => {
      const key = new Date(r.created_at).toLocaleString("en-US", {
        month: "short",
      });
      if (growthMap.has(key)) growthMap.set(key, (growthMap.get(key) ?? 0) + 1);
    });
  }

  return {
    topEvent,
    totalRsvps,
    totalEvents,
    upcomingCount,
    growth: months.map((month) => ({ month, rsvps: growthMap.get(month) ?? 0 })),
  };
}
