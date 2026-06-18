import { createClient } from "@/lib/supabase/server";
import { getUserAppAccess } from "./subscription-access";

export const SUBSCRIPTION_REQUIRED_MESSAGE =
  "Your subscription is inactive. Please upgrade on the billing page to continue.";

/**
 * Blocks server actions when the owner's trial/subscription is inactive.
 * Billing, auth, and data-rights actions should not call this.
 */
export async function requireActiveSubscription(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const access = await getUserAppAccess(user.id);
  if (access.restaurant && !access.isActive) {
    return { error: SUBSCRIPTION_REQUIRED_MESSAGE };
  }

  return {};
}
