"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markFeedbackResolved(
  feedbackId: string
): Promise<{ error?: string; success?: boolean }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("feedback")
    .update({ status: "resolved" })
    .eq("id", feedbackId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/feedback");
  revalidatePath("/dashboard");
  return { success: true };
}
