import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateSubscriptionStatus, recordPayment } from "@/lib/billing";

/**
 * Stripe Webhook Handler
 * Handles subscription lifecycle events from Stripe.
 */
export async function POST(request: Request) {
  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe is not configured" },
      { status: 500 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret is not configured" },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const restaurantId = session.metadata?.restaurant_id;

        if (restaurantId && session.subscription) {
          // Subscription created via checkout
          await supabase
            .from("subscriptions")
            .update({
              status: "active",
              provider: "stripe",
              provider_subscription_id: session.subscription as string,
              current_period_start: new Date().toISOString(),
            })
            .eq("restaurant_id", restaurantId);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const restaurantId = subscription.metadata?.restaurant_id;

        if (restaurantId) {
          let status: "active" | "past_due" | "cancelled" = "active";

          if (subscription.status === "past_due") {
            status = "past_due";
          } else if (
            subscription.status === "canceled" ||
            subscription.status === "unpaid"
          ) {
            status = "cancelled";
          }

          // Stripe Subscription object uses items.data[0].current_period_start/end
          // or we can use the subscription object directly if those fields exist
          const periodStart = (subscription as unknown as { current_period_start?: number }).current_period_start;
          const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

          await supabase
            .from("subscriptions")
            .update({
              status,
              provider_subscription_id: subscription.id,
              current_period_start: periodStart
                ? new Date(periodStart * 1000).toISOString()
                : undefined,
              current_period_end: periodEnd
                ? new Date(periodEnd * 1000).toISOString()
                : undefined,
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq("restaurant_id", restaurantId);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const restaurantId = subscription.metadata?.restaurant_id;

        if (restaurantId) {
          await updateSubscriptionStatus(restaurantId, "cancelled", {
            cancelled_at: new Date().toISOString(),
          });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        // Access subscription via type assertion for compatibility
        const invoiceData = invoice as unknown as {
          subscription?: string;
          payment_intent?: string;
          amount_paid: number;
          currency: string;
          hosted_invoice_url?: string;
          invoice_pdf?: string;
        };
        const subscriptionId = invoiceData.subscription;

        if (subscriptionId) {
          // Find our subscription by provider_subscription_id
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("id")
            .eq("provider_subscription_id", subscriptionId)
            .single();

          if (sub) {
            await recordPayment({
              subscriptionId: sub.id,
              provider: "stripe",
              providerPaymentId: invoiceData.payment_intent || invoice.id,
              providerInvoiceId: invoice.id,
              amount: invoiceData.amount_paid,
              currency: invoiceData.currency.toUpperCase(),
              status: "paid",
              invoiceUrl: invoiceData.hosted_invoice_url,
              receiptUrl: invoiceData.invoice_pdf,
            });
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const invoiceData = invoice as unknown as {
          subscription?: string;
          payment_intent?: string;
          amount_due: number;
          currency: string;
          last_finalization_error?: { message?: string };
        };
        const subscriptionId = invoiceData.subscription;

        if (subscriptionId) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("id, restaurant_id")
            .eq("provider_subscription_id", subscriptionId)
            .single();

          if (sub) {
            await updateSubscriptionStatus(sub.restaurant_id, "past_due");

            await recordPayment({
              subscriptionId: sub.id,
              provider: "stripe",
              providerPaymentId: invoiceData.payment_intent || invoice.id,
              providerInvoiceId: invoice.id,
              amount: invoiceData.amount_due,
              currency: invoiceData.currency.toUpperCase(),
              status: "failed",
              failureReason: invoiceData.last_finalization_error?.message,
            });
          }
        }
        break;
      }

      default:
        // Unhandled event type
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
