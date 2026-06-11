/**
 * PatronFlow database seeding script.
 *
 * Generates a self-contained, realistic demo dataset under a dedicated demo
 * restaurant so it NEVER touches real/production restaurants. Re-running is
 * idempotent: it wipes only the demo restaurant's child rows and regenerates.
 *
 * Run with: npm run seed
 *
 * Targets:
 *   - 300 customers (30 VIP, 20 At-Risk, 60 Regular, 190 New by segment rules)
 *   - 500 feedback submissions across the last 6 months
 *   -  50 negative feedback entries (rating <= 3)
 *   - 100 Google review click-throughs (review_clicked = true)
 *   - 500 customer visits (visit history mirroring feedback)
 *   - 100 loyalty transactions (+ a few reward rules)
 *   -  10 events (past completed + upcoming published + a draft)
 *   - 150 event RSVPs
 *
 * Segmentation (see src/lib/segments.ts) is derived from feedback rows:
 *   At-Risk = latest feedback > 60 days ago; VIP = 5+ feedback (recent);
 *   Regular = 2-4 (recent); New = 1 (recent).
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Env loading (no external dotenv dependency)
// ---------------------------------------------------------------------------
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // .env.local optional if vars already in environment
  }
}
loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (check .env.local)."
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Demo account / restaurant config
// ---------------------------------------------------------------------------
const DEMO_EMAIL = "demo@patronflow.app";
const DEMO_PASSWORD = "DemoPatron#2026";
const DEMO_RESTAURANT_NAME = "PatronFlow Demo Bistro";

// ---------------------------------------------------------------------------
// Random data pools
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna",
  "Ishaan", "Rohan", "Kabir", "Ananya", "Aadhya", "Diya", "Saanvi", "Pari",
  "Ira", "Myra", "Riya", "Aarohi", "Anika", "Navya", "Kiara", "Siya",
  "Rahul", "Vikram", "Karthik", "Nikhil", "Aman", "Siddharth", "Harshit",
  "Manish", "Pooja", "Sneha", "Priya", "Neha", "Kavya", "Meera", "Divya",
  "Shreya", "Tanvi", "Ritika", "Aishwarya", "Lakshmi", "Deepika", "Farhan",
  "Imran", "Zara", "Ayaan", "Tara",
];

const LAST_NAMES = [
  "Sharma", "Verma", "Patel", "Gupta", "Iyer", "Nair", "Reddy", "Rao",
  "Singh", "Kumar", "Mehta", "Joshi", "Desai", "Chopra", "Malhotra", "Kapoor",
  "Bose", "Banerjee", "Mukherjee", "Chatterjee", "Pillai", "Menon", "Shetty",
  "Hegde", "Naidu", "Bhat", "Agarwal", "Jain", "Khanna", "Sinha", "Das",
  "Ghosh", "Pandey", "Mishra", "Tiwari", "Khan", "Sheikh", "Ansari",
];

const POSITIVE_COMMENTS = [
  "Absolutely loved the food, will definitely come back!",
  "Great ambience and the staff was super friendly.",
  "The butter chicken was the best I've had in years.",
  "Quick service and delicious starters.",
  "Perfect spot for a family dinner. Highly recommend.",
  "Loved the dosa and filter coffee combo!",
  "Beautiful decor and amazing hospitality.",
  "The biryani was flavourful and well portioned.",
  "Fantastic experience, every dish was on point.",
  "Cozy place with excellent desserts.",
  "Staff went out of their way to make us comfortable.",
  "Fresh ingredients and great presentation.",
];

const NEGATIVE_COMMENTS = [
  "Service was slow and we waited too long for our order.",
  "Food was cold by the time it reached the table.",
  "The place was understaffed during peak hours.",
  "Portions were small for the price.",
  "The starter was a bit too salty for my taste.",
  "Ambience was nice but the music was too loud.",
  "We had to ask twice for water refills.",
  "Bill took forever to arrive after we asked.",
  "Expected better given the reviews.",
  "Table wasn't cleaned properly when we sat down.",
];

const CATEGORIES = ["Food", "Service", "Ambience", "Staff", "Other"] as const;
const RECOVERY_STATUSES = ["pending", "contacted", "resolved"] as const;

const EVENT_TITLES = [
  "Live Jazz Night",
  "Sunday Brunch Special",
  "Wine & Cheese Evening",
  "Diwali Dhamaka Dinner",
  "Chef's Tasting Menu",
  "Karaoke Friday",
  "Monsoon Food Festival",
  "New Year's Eve Gala",
  "Comedy & Cocktails",
  "Republic Day Feast",
];

const LOYALTY_REWARDS = [
  { reward_name: "Free Dessert", points_required: 100, reward_description: "Any dessert from the menu on the house." },
  { reward_name: "10% Off Bill", points_required: 200, reward_description: "Flat 10% discount on your total bill." },
  { reward_name: "Complimentary Starter", points_required: 150, reward_description: "A starter of your choice, free." },
  { reward_name: "Free Main Course", points_required: 400, reward_description: "Redeem for any main course." },
];

// ---------------------------------------------------------------------------
// Random helpers
// ---------------------------------------------------------------------------
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[rand(0, arr.length - 1)];

const DAY_MS = 24 * 60 * 60 * 1000;
/** ISO date for a point between minDaysAgo and maxDaysAgo in the past. */
function isoDaysAgo(maxDaysAgo: number, minDaysAgo = 0): string {
  const days = Math.random() * (maxDaysAgo - minDaysAgo) + minDaysAgo;
  return new Date(Date.now() - days * DAY_MS).toISOString();
}
/** ISO date for a point between minDaysAhead and maxDaysAhead in the future. */
function isoDaysAhead(maxDaysAhead: number, minDaysAhead = 0): string {
  const days = Math.random() * (maxDaysAhead - minDaysAhead) + minDaysAhead;
  return new Date(Date.now() + days * DAY_MS).toISOString();
}

const usedPhones = new Set<string>();
function uniquePhone(): string {
  let phone: string;
  do {
    phone = `+9198${String(rand(0, 99999999)).padStart(8, "0")}`;
  } while (usedPhones.has(phone));
  usedPhones.add(phone);
  return phone;
}

function randomBirthday(): string {
  const year = rand(1970, 2005);
  const month = rand(1, 12);
  const day = rand(1, 28);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Birthday whose month/day is today (random year) — to demo birthday alerts. */
function birthdayToday(): string {
  const now = new Date();
  const year = rand(1975, 2003);
  return `${year}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// Supabase admin client
// ---------------------------------------------------------------------------
const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function insertChunked<T>(
  client: SupabaseClient,
  table: string,
  rows: T[],
  chunkSize = 200
) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await client.from(table).insert(chunk as object[]);
    if (error) {
      throw new Error(`Insert into ${table} failed: ${error.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Find or create the isolated demo owner + restaurant
// ---------------------------------------------------------------------------
async function getOrCreateDemoRestaurant(): Promise<string> {
  // Find an existing demo user (paginate a few pages).
  let userId: string | undefined;
  for (let page = 1; page <= 5 && !userId; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    userId = data.users.find((u) => u.email === DEMO_EMAIL)?.id;
    if (data.users.length < 1000) break;
  }

  if (!userId) {
    const { data, error } = await admin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { restaurant_name: DEMO_RESTAURANT_NAME },
    });
    if (error || !data.user) {
      throw new Error(`createUser failed: ${error?.message}`);
    }
    userId = data.user.id;
    console.log(`Created demo owner: ${DEMO_EMAIL}`);
  } else {
    console.log(`Reusing existing demo owner: ${DEMO_EMAIL}`);
  }

  // The on_auth_user_created trigger auto-provisions a restaurant row.
  let { data: restaurant } = await admin
    .from("restaurants")
    .select("id")
    .eq("owner_id", userId)
    .maybeSingle();

  if (!restaurant) {
    const { data, error } = await admin
      .from("restaurants")
      .insert({ owner_id: userId, name: DEMO_RESTAURANT_NAME })
      .select("id")
      .single();
    if (error || !data) throw new Error(`restaurant create failed: ${error?.message}`);
    restaurant = data;
  }

  await admin
    .from("restaurants")
    .update({
      name: DEMO_RESTAURANT_NAME,
      onboarded: true,
      cuisine_type: "Multi-cuisine",
      google_review_url: "https://g.page/r/patronflow-demo/review",
    })
    .eq("id", restaurant.id);

  return restaurant.id;
}

/** Wipe ONLY the demo restaurant's child data so re-runs are clean. */
async function wipeDemoData(restaurantId: string) {
  // Deleting customers cascades to feedback, customer_visits, loyalty_transactions.
  // Deleting events cascades to event_rsvps.
  await admin.from("events").delete().eq("restaurant_id", restaurantId);
  await admin.from("loyalty_rules").delete().eq("restaurant_id", restaurantId);
  await admin.from("customers").delete().eq("restaurant_id", restaurantId);
  // Defensive: clear anything not covered by cascade.
  await admin.from("feedback").delete().eq("restaurant_id", restaurantId);
  await admin.from("customer_visits").delete().eq("restaurant_id", restaurantId);
  await admin.from("loyalty_transactions").delete().eq("restaurant_id", restaurantId);
  await admin.from("table_qrs").delete().eq("restaurant_id", restaurantId);
}

// ---------------------------------------------------------------------------
// Data generation
// ---------------------------------------------------------------------------
type Segment = "VIP" | "AtRisk" | "Regular" | "New";

interface SeedCustomer {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  created_at: string;
  _segment: Segment;
  _feedbackDates: string[];
}

function buildCustomers(restaurantId: string): SeedCustomer[] {
  const plan: { segment: Segment; count: number }[] = [
    { segment: "VIP", count: 30 },
    { segment: "AtRisk", count: 20 },
    { segment: "Regular", count: 60 },
    { segment: "New", count: 190 },
  ];

  const customers: SeedCustomer[] = [];
  let index = 0;

  for (const { segment, count } of plan) {
    for (let i = 0; i < count; i++) {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const name = `${first} ${last}`;

      // Feedback dates drive segmentation.
      let feedbackDates: string[] = [];
      if (segment === "VIP") {
        // Exactly 5 visits (>=5 ⇒ VIP), spread across 6 months with the
        // most recent guaranteed within 35 days so they aren't "At Risk".
        feedbackDates = [
          isoDaysAgo(35, 0),
          ...Array.from({ length: 4 }, () => isoDaysAgo(170, 0)),
        ];
      } else if (segment === "AtRisk") {
        feedbackDates = [isoDaysAgo(120, 65), isoDaysAgo(175, 121)]; // 2 old visits
      } else if (segment === "Regular") {
        feedbackDates = [isoDaysAgo(150, 0), isoDaysAgo(50, 0)]; // latest recent
      } else {
        feedbackDates = [isoDaysAgo(55, 0)]; // single recent visit
      }

      const earliest = feedbackDates
        .map((d) => new Date(d).getTime())
        .reduce((a, b) => Math.min(a, b));
      const createdAt = new Date(earliest - rand(0, 3) * DAY_MS).toISOString();

      // A few birthdays land on today to demo the birthday notification.
      const birthday =
        index < 3 ? birthdayToday() : Math.random() < 0.85 ? randomBirthday() : null;

      customers.push({
        id: randomUUID(),
        restaurant_id: restaurantId,
        name,
        phone: uniquePhone(),
        email:
          Math.random() < 0.8
            ? `${first}.${last}${rand(1, 999)}@gmail.com`.toLowerCase()
            : null,
        birthday,
        created_at: createdAt,
        _segment: segment,
        _feedbackDates: feedbackDates,
      });
      index++;
    }
  }

  return customers;
}

interface SeedFeedback {
  restaurant_id: string;
  customer_id: string;
  rating: number;
  comment: string | null;
  category: (typeof CATEGORIES)[number];
  status: "pending" | "resolved";
  table_name: string | null;
  source: string;
  review_clicked: boolean;
  recovery_status: (typeof RECOVERY_STATUSES)[number];
  recovery_notes: string | null;
  created_at: string;
}

interface SeedVisit {
  restaurant_id: string;
  customer_id: string;
  visit_date: string;
  table_name: string | null;
  source: string;
  created_at: string;
}

function buildFeedbackAndVisits(
  restaurantId: string,
  customers: SeedCustomer[]
): { feedback: SeedFeedback[]; visits: SeedVisit[] } {
  // Flatten every (customer, date) into feedback slots.
  interface Slot {
    customer: SeedCustomer;
    date: string;
  }
  const slots: Slot[] = [];
  for (const c of customers) {
    for (const date of c._feedbackDates) slots.push({ customer: c, date });
  }

  // Choose which slots are negative (rating <= 3). Prefer At-Risk customers
  // (unhappy → lapsed), then fill the rest randomly.
  const NEGATIVE_TARGET = 50;
  const REVIEW_CLICK_TARGET = 100;

  const atRiskSlots = slots.filter((s) => s.customer._segment === "AtRisk");
  const otherSlots = slots.filter((s) => s.customer._segment !== "AtRisk");
  shuffle(atRiskSlots);
  shuffle(otherSlots);

  const negativeSet = new Set<Slot>();
  for (const s of atRiskSlots) {
    if (negativeSet.size >= NEGATIVE_TARGET) break;
    negativeSet.add(s);
  }
  for (const s of otherSlots) {
    if (negativeSet.size >= NEGATIVE_TARGET) break;
    negativeSet.add(s);
  }

  const feedback: SeedFeedback[] = [];
  const visits: SeedVisit[] = [];
  const positiveSlots: { slot: Slot; index: number }[] = [];

  slots.forEach((slot) => {
    const isNegative = negativeSet.has(slot);
    const rating = isNegative ? rand(1, 3) : Math.random() < 0.65 ? 5 : 4;
    const tableName = Math.random() < 0.7 ? `Table ${rand(1, 18)}` : null;
    const source = tableName ? "table-qr" : "direct";

    const fb: SeedFeedback = {
      restaurant_id: restaurantId,
      customer_id: slot.customer.id,
      rating,
      comment:
        Math.random() < 0.85
          ? isNegative
            ? pick(NEGATIVE_COMMENTS)
            : pick(POSITIVE_COMMENTS)
          : null,
      category: pick(CATEGORIES),
      status: isNegative && Math.random() < 0.5 ? "resolved" : "pending",
      table_name: tableName,
      source,
      review_clicked: false,
      recovery_status: isNegative ? pick(RECOVERY_STATUSES) : "pending",
      recovery_notes:
        isNegative && Math.random() < 0.4
          ? "Reached out with an apology and a discount voucher."
          : null,
      created_at: slot.date,
    };

    if (!isNegative && rating >= 4) {
      positiveSlots.push({ slot, index: feedback.length });
    }
    feedback.push(fb);

    visits.push({
      restaurant_id: restaurantId,
      customer_id: slot.customer.id,
      visit_date: slot.date,
      table_name: tableName,
      source,
      created_at: slot.date,
    });
  });

  // Mark 100 positive feedback as having clicked through to Google.
  shuffle(positiveSlots);
  for (let i = 0; i < Math.min(REVIEW_CLICK_TARGET, positiveSlots.length); i++) {
    feedback[positiveSlots[i].index].review_clicked = true;
  }

  return { feedback, visits };
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

interface SeedLoyaltyTxn {
  restaurant_id: string;
  customer_id: string;
  points: number;
  transaction_type: "earned" | "redeemed" | "adjusted";
  notes: string | null;
  created_at: string;
}

function buildLoyalty(
  restaurantId: string,
  customers: SeedCustomer[]
): SeedLoyaltyTxn[] {
  // Prefer engaged customers (VIP + Regular) for loyalty activity.
  const engaged = customers.filter(
    (c) => c._segment === "VIP" || c._segment === "Regular"
  );
  const pool = engaged.length > 0 ? engaged : customers;

  // Reward costs a redemption can be settled against (must equal a real reward).
  const rewardCosts = LOYALTY_REWARDS.map((r) => r.points_required).sort(
    (a, b) => a - b
  );

  // Track each customer's running balance so redemptions never exceed what
  // they've earned (keeps Points Redeemed <= Points Issued, balance >= 0).
  const balances = new Map<string, number>();

  const txns: SeedLoyaltyTxn[] = [];
  while (txns.length < 100) {
    const c = pick(pool);
    const balance = balances.get(c.id) ?? 0;
    const affordable = rewardCosts.filter((cost) => cost <= balance);

    const roll = Math.random();
    let type: SeedLoyaltyTxn["transaction_type"];
    if (roll < 0.7 || affordable.length === 0) {
      type = "earned";
    } else if (roll < 0.93) {
      type = "redeemed";
    } else {
      type = "adjusted";
    }

    let points: number;
    let notes: string;
    if (type === "earned") {
      points = rand(10, 120);
      notes = "Earned from a visit";
      balances.set(c.id, balance + points);
    } else if (type === "redeemed") {
      points = pick(affordable); // <= current balance, matches a reward cost
      notes = "Redeemed for a reward";
      balances.set(c.id, balance - points);
    } else {
      points = rand(5, 40); // positive goodwill adjustment
      notes = "Manual adjustment";
      balances.set(c.id, balance + points);
    }

    txns.push({
      restaurant_id: restaurantId,
      customer_id: c.id,
      points,
      transaction_type: type,
      notes,
      created_at: isoDaysAgo(175, 0),
    });
  }

  // Make each customer's history chronological: generation order is already
  // earn-before-redeem, so assign ascending dates per customer in that order.
  const byCustomer = new Map<string, SeedLoyaltyTxn[]>();
  for (const t of txns) {
    const list = byCustomer.get(t.customer_id) ?? [];
    list.push(t);
    byCustomer.set(t.customer_id, list);
  }
  for (const list of byCustomer.values()) {
    const dates = list
      .map(() => new Date(Date.now() - rand(0, 175) * DAY_MS).getTime())
      .sort((a, b) => a - b);
    list.forEach((t, i) => {
      t.created_at = new Date(dates[i]).toISOString();
    });
  }

  return txns;
}

interface SeedEvent {
  id: string;
  restaurant_id: string;
  title: string;
  description: string;
  event_date: string;
  cover_image: null;
  status: "draft" | "published" | "completed";
  created_at: string;
}

function buildEvents(restaurantId: string): SeedEvent[] {
  const events: SeedEvent[] = [];
  const titles = shuffleCopy(EVENT_TITLES);

  // 5 completed (past), 4 published (upcoming), 1 draft (upcoming).
  const specs: { status: SeedEvent["status"]; date: () => string }[] = [
    { status: "completed", date: () => isoDaysAgo(170, 130) },
    { status: "completed", date: () => isoDaysAgo(125, 90) },
    { status: "completed", date: () => isoDaysAgo(85, 55) },
    { status: "completed", date: () => isoDaysAgo(50, 25) },
    { status: "completed", date: () => isoDaysAgo(20, 5) },
    { status: "published", date: () => isoDaysAhead(15, 3) },
    { status: "published", date: () => isoDaysAhead(35, 16) },
    { status: "published", date: () => isoDaysAhead(60, 36) },
    { status: "published", date: () => isoDaysAhead(90, 61) },
    { status: "draft", date: () => isoDaysAhead(120, 91) },
  ];

  specs.forEach((spec, i) => {
    const eventDate = spec.date();
    const createdAt =
      spec.status === "completed"
        ? new Date(new Date(eventDate).getTime() - rand(10, 30) * DAY_MS).toISOString()
        : isoDaysAgo(40, 0);
    events.push({
      id: randomUUID(),
      restaurant_id: restaurantId,
      title: titles[i] ?? `Special Event ${i + 1}`,
      description:
        "Join us for a memorable evening of great food, drinks, and company. Limited seats — RSVP to reserve your spot!",
      event_date: eventDate,
      cover_image: null,
      status: spec.status,
      created_at: createdAt,
    });
  });

  return events;
}

function shuffleCopy<T>(arr: readonly T[]): T[] {
  const copy = [...arr];
  shuffle(copy);
  return copy;
}

interface SeedRsvp {
  event_id: string;
  name: string;
  phone: string;
  email: string | null;
  attended: boolean;
  created_at: string;
}

function buildRsvps(events: SeedEvent[]): SeedRsvp[] {
  const rsvps: SeedRsvp[] = [];
  // Distribute 150 RSVPs across events that accept them (published + completed).
  const rsvpEvents = events.filter((e) => e.status !== "draft");
  const TOTAL = 150;
  const perEvent = Math.floor(TOTAL / rsvpEvents.length);
  let remaining = TOTAL;

  rsvpEvents.forEach((event, idx) => {
    const count =
      idx === rsvpEvents.length - 1 ? remaining : perEvent + rand(-3, 3);
    const n = Math.max(0, Math.min(count, remaining));
    remaining -= n;

    for (let i = 0; i < n; i++) {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const attended =
        event.status === "completed" ? Math.random() < 0.65 : false;
      const createdAt = new Date(
        new Date(event.created_at).getTime() + rand(0, 10) * DAY_MS
      ).toISOString();
      rsvps.push({
        event_id: event.id,
        name: `${first} ${last}`,
        phone: `+9197${String(rand(0, 99999999)).padStart(8, "0")}`,
        email:
          Math.random() < 0.6
            ? `${first}.${last}${rand(1, 999)}@gmail.com`.toLowerCase()
            : null,
        attended,
        created_at: createdAt,
      });
    }
  });

  return rsvps;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main() {
  console.log("\nPatronFlow seed — generating demo data (production-safe).\n");
  console.log(`Target Supabase: ${SUPABASE_URL}`);

  const restaurantId = await getOrCreateDemoRestaurant();
  console.log(`Demo restaurant id: ${restaurantId}`);

  console.log("Wiping existing demo data…");
  await wipeDemoData(restaurantId);

  console.log("Building dataset…");
  const customers = buildCustomers(restaurantId);
  const { feedback, visits } = buildFeedbackAndVisits(restaurantId, customers);
  const loyalty = buildLoyalty(restaurantId, customers);
  const events = buildEvents(restaurantId);
  const rsvps = buildRsvps(events);

  const loyaltyRules = LOYALTY_REWARDS.map((r) => ({
    restaurant_id: restaurantId,
    ...r,
  }));

  // Strip internal-only fields before insert.
  const customerRows = customers.map(
    ({ _segment, _feedbackDates, ...row }) => {
      void _segment;
      void _feedbackDates;
      return row;
    }
  );
  const eventRows = events.map((e) => e);

  console.log("Inserting customers…");
  await insertChunked(admin, "customers", customerRows);
  console.log("Inserting feedback…");
  await insertChunked(admin, "feedback", feedback);
  console.log("Inserting customer visits…");
  await insertChunked(admin, "customer_visits", visits);
  console.log("Inserting loyalty rules…");
  await insertChunked(admin, "loyalty_rules", loyaltyRules);
  console.log("Inserting loyalty transactions…");
  await insertChunked(admin, "loyalty_transactions", loyalty);
  console.log("Inserting events…");
  await insertChunked(admin, "events", eventRows);
  console.log("Inserting event RSVPs…");
  await insertChunked(admin, "event_rsvps", rsvps);

  const negativeCount = feedback.filter((f) => f.rating <= 3).length;
  const reviewClicks = feedback.filter((f) => f.review_clicked).length;
  const vipCount = customers.filter((c) => c._segment === "VIP").length;
  const atRiskCount = customers.filter((c) => c._segment === "AtRisk").length;

  console.log("\n Seed complete!\n");
  console.log("Summary");
  console.log(`  Customers          : ${customers.length}`);
  console.log(`  Feedback           : ${feedback.length}`);
  console.log(`  Negative feedback  : ${negativeCount}`);
  console.log(`  Google review clicks: ${reviewClicks}`);
  console.log(`  Customer visits    : ${visits.length}`);
  console.log(`  Loyalty txns       : ${loyalty.length}`);
  console.log(`  Loyalty rewards    : ${loyaltyRules.length}`);
  console.log(`  Events             : ${events.length}`);
  console.log(`  Event RSVPs        : ${rsvps.length}`);
  console.log(`  VIP customers      : ${vipCount}`);
  console.log(`  At-risk customers  : ${atRiskCount}`);
  console.log("\nLog in to view the demo dashboard:");
  console.log(`  Email   : ${DEMO_EMAIL}`);
  console.log(`  Password: ${DEMO_PASSWORD}\n`);
}

main().catch((err) => {
  console.error("\nSeed failed:", err.message);
  process.exit(1);
});
