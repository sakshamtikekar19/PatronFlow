import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicFeedbackResponse } from "@/types";
import { z } from "zod";

const feedbackSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  category: z
    .enum(["Food", "Service", "Ambience", "Staff", "Other"])
    .optional()
    .default("Other"),
  tableName: z.string().trim().min(1).max(80).optional(),
  source: z.string().trim().max(80).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { restaurantId, name, phone, rating, comment, category, tableName, source } =
      parsed.data;

    const supabase = createAdminClient();

    const { data: restaurant, error: restaurantError } = await supabase
      .from("restaurants")
      .select("id, google_review_url")
      .eq("id", restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { success: false, message: "Restaurant not found" },
        { status: 404 }
      );
    }

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id")
      .eq("restaurant_id", restaurantId)
      .eq("phone", phone)
      .maybeSingle();

    let customerId: string;

    if (existingCustomer) {
      customerId = existingCustomer.id;
      await supabase
        .from("customers")
        .update({ name })
        .eq("id", customerId);
    } else {
      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          restaurant_id: restaurantId,
          name,
          phone,
        })
        .select("id")
        .single();

      if (customerError || !newCustomer) {
        return NextResponse.json(
          { success: false, message: "Failed to create customer" },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    const showGoogleReview = rating >= 4;

    const { data: feedbackRow, error: feedbackError } = await supabase
      .from("feedback")
      .insert({
        restaurant_id: restaurantId,
        customer_id: customerId,
        rating,
        comment: comment ?? null,
        category,
        status: "pending",
        table_name: tableName ?? null,
        source: source ?? (tableName ? "table-qr" : "direct"),
      })
      .select("id")
      .single();

    if (feedbackError || !feedbackRow) {
      return NextResponse.json(
        { success: false, message: "Failed to save feedback" },
        { status: 500 }
      );
    }

    // Auto-track a visit alongside the feedback (best-effort; never blocks the
    // guest-facing response).
    await supabase.from("customer_visits").insert({
      restaurant_id: restaurantId,
      customer_id: customerId,
      table_name: tableName ?? null,
      source: source ?? (tableName ? "table-qr" : "direct"),
    });

    const response: PublicFeedbackResponse = {
      success: true,
      showGoogleReview,
      googleReviewUrl: showGoogleReview ? restaurant.google_review_url : null,
      message: showGoogleReview
        ? "Thank you for your feedback!"
        : "Thank you for helping us improve.",
      feedbackId: feedbackRow.id,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
