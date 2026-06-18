import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { PublicFeedbackResponse } from "@/types";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  rateLimiters,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";
import { sanitizeName, sanitizePhone, sanitizeComment } from "@/lib/sanitize";

const feedbackSchema = z.object({
  restaurantId: z.string().uuid(),
  name: z.string().trim().min(1, "Name is required").optional(),
  phone: z.string().min(1, "Phone is required"),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Birthday must be a valid date")
    .optional(),
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
    // Rate limiting
    const ip = await getClientIp();
    const rateLimit = await checkRateLimit(
      `feedback:${ip}`,
      rateLimiters.publicApi,
      "feedback"
    );
    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit);
    }
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    // Sanitize user input
    const sanitizedData = {
      restaurantId: parsed.data.restaurantId,
      name: parsed.data.name ? sanitizeName(parsed.data.name) : undefined,
      phone: sanitizePhone(parsed.data.phone),
      birthday: parsed.data.birthday,
      rating: parsed.data.rating,
      comment: parsed.data.comment ? sanitizeComment(parsed.data.comment) : undefined,
      category: parsed.data.category,
      tableName: parsed.data.tableName ? sanitizeName(parsed.data.tableName) : undefined,
      source: parsed.data.source ? sanitizeName(parsed.data.source) : undefined,
    };

    const { restaurantId, name, phone, birthday, rating, comment, category, tableName, source } =
      sanitizedData;

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
      .select("id, name")
      .eq("restaurant_id", restaurantId)
      .eq("phone", phone)
      .maybeSingle();

    let customerId: string;
    let hasPriorPositive = false;

    if (existingCustomer) {
      customerId = existingCustomer.id;

      // Has this guest already left a positive (4-5★) review before? Google
      // only allows one review per guest, so we ask once and nudge loyalty
      // on later visits.
      const { count } = await supabase
        .from("feedback")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("customer_id", customerId)
        .gte("rating", 4);
      hasPriorPositive = (count ?? 0) > 0;

      const updates: { name?: string; birthday?: string } = {};
      if (name) updates.name = name;
      if (birthday) updates.birthday = birthday;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from("customers")
          .update(updates)
          .eq("id", customerId);
      }
    } else {
      if (!name || !birthday) {
        return NextResponse.json(
          {
            success: false,
            message: "Name and birthday are required for first-time guests",
          },
          { status: 400 }
        );
      }

      const { data: newCustomer, error: customerError } = await supabase
        .from("customers")
        .insert({
          restaurant_id: restaurantId,
          name,
          phone,
          birthday: birthday ?? null,
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

    const isPositive = rating >= 4;
    // Ask for a Google review only the FIRST time a guest is happy (Google
    // caps reviews at one per guest). Returning happy guests get a loyalty nudge.
    const showGoogleReview =
      isPositive && !hasPriorPositive && !!restaurant.google_review_url;
    const showLoyaltyNudge = isPositive && !showGoogleReview;

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

    // Pull the most accessible reward to make the loyalty nudge enticing.
    let loyaltyReward: { name: string; points: number } | null = null;
    if (showLoyaltyNudge) {
      const { data: reward } = await supabase
        .from("loyalty_rules")
        .select("reward_name, points_required")
        .eq("restaurant_id", restaurantId)
        .order("points_required", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (reward) {
        loyaltyReward = {
          name: reward.reward_name,
          points: reward.points_required,
        };
      }
    }

    let message: string;
    if (!isPositive) {
      message = "Thank you for helping us improve.";
    } else if (showGoogleReview) {
      message = "Thank you for your feedback!";
    } else {
      message = "Thanks for coming back!";
    }

    const response: PublicFeedbackResponse = {
      success: true,
      showGoogleReview,
      googleReviewUrl: showGoogleReview ? restaurant.google_review_url : null,
      message,
      feedbackId: feedbackRow.id,
      showLoyaltyNudge,
      loyaltyReward,
    };

    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
