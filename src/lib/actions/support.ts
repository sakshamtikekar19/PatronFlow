"use server";

import { createAdminClient } from "@/lib/supabase/admin";

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
): Promise<{ error?: string }> {
  const name = input.name.trim();
  const email = input.email.trim();
  const subject = input.subject.trim();
  const message = input.message.trim();

  if (!name || !email || !subject || !message) {
    return { error: "All fields are required" };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("support_requests").insert({
    type: input.type ?? "contact",
    name,
    email,
    subject,
    message,
    restaurant_id: input.restaurantId ?? null,
  });

  if (error) return { error: error.message };
  return {};
}
