import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Cron job: Check and update subscription statuses
 * Runs daily at midnight (configured in vercel.json)
 *
 * Updates subscriptions that have expired trials or past-due periods.
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    // Expire trials that have passed their end date
    const { data: expiredTrials, error: trialError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "trialing")
      .lt("trial_ends_at", now)
      .select("id");

    if (trialError) {
      console.error("Failed to expire trials:", trialError);
    }

    // Expire past_due subscriptions that have exceeded grace period (3 days)
    const gracePeriodEnd = new Date();
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() - 3);

    const { data: expiredPastDue, error: pastDueError } = await supabase
      .from("subscriptions")
      .update({ status: "expired" })
      .eq("status", "past_due")
      .lt("current_period_end", gracePeriodEnd.toISOString())
      .select("id");

    if (pastDueError) {
      console.error("Failed to expire past_due subscriptions:", pastDueError);
    }

    return NextResponse.json({
      success: true,
      expiredTrials: expiredTrials?.length || 0,
      expiredPastDue: expiredPastDue?.length || 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Subscription check cron failed:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
