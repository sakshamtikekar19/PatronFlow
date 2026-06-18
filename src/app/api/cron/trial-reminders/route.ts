import { NextResponse } from "next/server";
import { getTrialsEndingSoon } from "@/lib/billing/trial";

/**
 * Cron job: Send trial expiration reminders
 * Runs daily at 9 AM (configured in vercel.json)
 *
 * This is a placeholder that logs trials ending soon.
 * In production, integrate with your email service (Resend, SendGrid, etc.)
 */
export async function GET(request: Request) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without secret
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // Get trials ending in the next 3 days
    const trials = await getTrialsEndingSoon(3);

    console.log(`Found ${trials.length} trials ending soon`);

    for (const trial of trials) {
      // TODO: Send email notification
      // await sendTrialReminderEmail({
      //   restaurantId: trial.restaurantId,
      //   ownerId: trial.ownerId,
      //   daysRemaining: trial.daysRemaining,
      // });

      console.log(
        `Trial reminder needed for restaurant ${trial.restaurantId}: ${trial.daysRemaining} days remaining`
      );
    }

    return NextResponse.json({
      success: true,
      processed: trials.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Trial reminder cron failed:", error);
    return NextResponse.json(
      { error: "Cron job failed" },
      { status: 500 }
    );
  }
}
