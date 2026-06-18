import { NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/razorpay/subscription";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  processRazorpayWebhookEvent,
  type RazorpayWebhookEvent,
} from "@/lib/razorpay/webhook-handlers";

/**
 * Razorpay Webhook Handler
 * Handles subscription and payment events from Razorpay.
 */
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  if (!verifyRazorpayWebhook(body, signature)) {
    console.error("Razorpay webhook signature verification failed");
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const event: RazorpayWebhookEvent = JSON.parse(body);
  const supabase = createAdminClient();

  try {
    await processRazorpayWebhookEvent(supabase, event);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Razorpay webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
