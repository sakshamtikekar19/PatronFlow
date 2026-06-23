"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { writeAuditLog } from "@/lib/admin/audit";
import { checkRateLimit, getClientIp, rateLimiters } from "@/lib/rate-limit";

export interface SubmitSupportRequestInput {
  type?: "contact" | "bug" | "feature";
  name: string;
  email: string;
  subject: string;
  message: string;
  restaurantId?: string;
}

export async function submitSupportRequest(
  input: SubmitSupportRequestInput
): Promise<{ error?: string; success?: boolean }> {
  const ip = await getClientIp();
  const rateLimit = await checkRateLimit(
    `support:${ip}`,
    { limit: 5, windowSeconds: 3600 },
    "support"
  );

  if (!rateLimit.success) {
    return {
      error: "Too many requests. Please try again later or email us directly.",
    };
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name || !email || !subject || !message) {
    return { error: "All fields are required" };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("support_requests")
    .insert({
      type: input.type ?? "contact",
      name,
      email,
      subject,
      message,
      restaurant_id: input.restaurantId ?? null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await writeAuditLog({
    actorEmail: email,
    action: "support.received",
    entityType: "support_request",
    entityId: data.id,
    metadata: {
      type: input.type ?? "contact",
      subject,
      restaurantId: input.restaurantId ?? null,
    },
  });

  return { success: true };
}
