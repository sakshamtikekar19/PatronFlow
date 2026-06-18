"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireActiveSubscription } from "@/lib/billing/guards";
import type { RecoveryStatus } from "@/types";

export async function updateRecoveryStatus(
  feedbackId: string,
  status: RecoveryStatus
): Promise<{ error?: string; success?: boolean }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const { error } = await supabase
    .from("feedback")
    .update({ recovery_status: status })
    .eq("id", feedbackId);

  if (error) return { error: error.message };

  revalidatePath("/recovery");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateRecoveryNotes(
  feedbackId: string,
  notes: string
): Promise<{ error?: string; success?: boolean }> {
  const subscriptionError = await requireActiveSubscription();
  if (subscriptionError.error) return subscriptionError;

  const supabase = await createClient();

  const { error } = await supabase
    .from("feedback")
    .update({ recovery_notes: notes.trim() || null })
    .eq("id", feedbackId);

  if (error) return { error: error.message };

  revalidatePath("/recovery");
  return { success: true };
}
