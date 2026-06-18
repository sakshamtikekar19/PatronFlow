import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";
import {
  checkRateLimit,
  getClientIp,
  rateLimiters,
  rateLimitExceededResponse,
} from "@/lib/rate-limit";
import { sanitizePhone } from "@/lib/sanitize";

const lookupSchema = z.object({
  restaurantId: z.string().uuid(),
  phone: z.string().trim().min(1, "Phone is required"),
});

export async function POST(request: Request) {
  try {
    // Rate limiting - stricter for lookup to prevent enumeration
    const ip = await getClientIp();
    const rateLimit = checkRateLimit(`lookup:${ip}`, rateLimiters.lookup);
    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit);
    }
    const body = await request.json();
    const parsed = lookupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          found: false,
          message: parsed.error.issues[0]?.message ?? "Invalid input",
        },
        { status: 400 }
      );
    }

    const { restaurantId } = parsed.data;
    const phone = sanitizePhone(parsed.data.phone);
    const supabase = createAdminClient();

    const { data: customer } = await supabase
      .from("customers")
      .select("name")
      .eq("restaurant_id", restaurantId)
      .eq("phone", phone)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ found: false });
    }

    return NextResponse.json({
      found: true,
      name: customer.name,
    });
  } catch {
    return NextResponse.json(
      { found: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
