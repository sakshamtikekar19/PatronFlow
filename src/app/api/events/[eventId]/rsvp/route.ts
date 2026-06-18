import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  rateLimiters,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";
import { sanitizeName, sanitizePhone, sanitizeEmail } from "@/lib/sanitize";

const rsvpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    // Rate limiting
    const ip = await getClientIp();
    const rateLimit = await checkRateLimit(
      `rsvp:${ip}`,
      rateLimiters.publicApi,
      "rsvp"
    );
    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit);
    }
    const { eventId } = await params;
    const body = await request.json();
    const parsed = rsvpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: event } = await supabase
      .from("events")
      .select("id, status")
      .eq("id", eventId)
      .maybeSingle();

    if (!event || event.status === "draft") {
      return NextResponse.json(
        { success: false, message: "Event not found" },
        { status: 404 }
      );
    }

    // Sanitize user input
    const name = sanitizeName(parsed.data.name);
    const phone = sanitizePhone(parsed.data.phone);
    const email = parsed.data.email ? sanitizeEmail(parsed.data.email) : null;

    const { error } = await supabase.from("event_rsvps").insert({
      event_id: eventId,
      name,
      phone,
      email,
    });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Failed to save RSVP" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "You're on the list! We'll see you there.",
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
