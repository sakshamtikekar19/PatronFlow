import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getCustomersWithStats } from "@/lib/queries/customers";
import { classifyCustomer } from "@/lib/segments";
import { toCsv, csvResponseHeaders } from "@/lib/csv";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const restaurant = await getRestaurantForUser();
  if (!restaurant) {
    return NextResponse.json({ error: "No restaurant" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let customers = await getCustomersWithStats(restaurant.id);

  if (from) {
    const fromTime = new Date(from).getTime();
    customers = customers.filter(
      (c) => new Date(c.created_at).getTime() >= fromTime
    );
  }
  if (to) {
    const toTime = new Date(to).getTime() + 24 * 60 * 60 * 1000;
    customers = customers.filter(
      (c) => new Date(c.created_at).getTime() <= toTime
    );
  }

  const rows = customers.map((c) => ({
    name: c.name,
    phone: c.phone,
    email: c.email ?? "",
    visits: c.visits,
    average_rating: c.average_rating,
    segment: classifyCustomer(c),
    last_visit: c.last_visit ?? "",
    customer_since: c.created_at,
  }));

  const csv = toCsv(rows, [
    { key: "name", header: "Name" },
    { key: "phone", header: "Phone" },
    { key: "email", header: "Email" },
    { key: "visits", header: "Visits" },
    { key: "average_rating", header: "Average Rating" },
    { key: "segment", header: "Segment" },
    { key: "last_visit", header: "Last Visit" },
    { key: "customer_since", header: "Customer Since" },
  ]);

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: csvResponseHeaders(`customers-${date}.csv`),
  });
}
