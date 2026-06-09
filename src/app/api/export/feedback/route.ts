import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { toCsv, csvResponseHeaders } from "@/lib/csv";
import type { FeedbackWithCustomer } from "@/types";

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

  let query = supabase
    .from("feedback")
    .select("*, customer:customers(id, name, phone, email)")
    .eq("restaurant_id", restaurant.id)
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from);
  if (to) {
    const toEnd = new Date(new Date(to).getTime() + 24 * 60 * 60 * 1000);
    query = query.lte("created_at", toEnd.toISOString());
  }

  const { data } = await query;

  const feedback = (data ?? []).map((item) => ({
    ...item,
    customer: Array.isArray(item.customer) ? item.customer[0] : item.customer,
  })) as FeedbackWithCustomer[];

  const rows = feedback.map((f) => ({
    customer: f.customer?.name ?? "",
    phone: f.customer?.phone ?? "",
    rating: f.rating,
    category: f.category,
    status: f.status,
    table_name: f.table_name ?? "",
    review_clicked: f.review_clicked ? "Yes" : "No",
    comment: f.comment ?? "",
    date: f.created_at,
  }));

  const csv = toCsv(rows, [
    { key: "customer", header: "Customer" },
    { key: "phone", header: "Phone" },
    { key: "rating", header: "Rating" },
    { key: "category", header: "Category" },
    { key: "status", header: "Status" },
    { key: "table_name", header: "Table" },
    { key: "review_clicked", header: "Left Google Review" },
    { key: "comment", header: "Comment" },
    { key: "date", header: "Date" },
  ]);

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: csvResponseHeaders(`feedback-${date}.csv`),
  });
}
