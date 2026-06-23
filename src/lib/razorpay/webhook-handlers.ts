import type { SupabaseClient } from "@supabase/supabase-js";
import { updateSubscriptionStatus, recordPayment } from "@/lib/billing";
import { writeAuditLog } from "@/lib/admin/audit";

export interface RazorpaySubscriptionEntity {
  id: string;
  status: string;
  current_start?: number | null;
  current_end?: number | null;
  notes?: {
    restaurant_id?: string;
  };
}

export interface RazorpayPaymentEntity {
  id: string;
  amount: number;
  currency: string;
  status: string;
  invoice_id?: string;
  notes?: {
    restaurant_id?: string;
  };
  error_description?: string;
}

export interface RazorpayWebhookEvent {
  event: string;
  payload: {
    subscription?: { entity: RazorpaySubscriptionEntity };
    payment?: { entity: RazorpayPaymentEntity };
  };
}

function periodUpdateFields(subscription: RazorpaySubscriptionEntity) {
  const fields: Record<string, string> = {
    status: "active",
    provider: "razorpay",
    provider_subscription_id: subscription.id,
  };

  if (subscription.current_start) {
    fields.current_period_start = new Date(
      subscription.current_start * 1000
    ).toISOString();
  }

  if (subscription.current_end) {
    fields.current_period_end = new Date(
      subscription.current_end * 1000
    ).toISOString();
  }

  return fields;
}

async function resolveRestaurantId(
  supabase: SupabaseClient,
  subscription: RazorpaySubscriptionEntity
): Promise<string | null> {
  if (subscription.notes?.restaurant_id) {
    return subscription.notes.restaurant_id;
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("restaurant_id")
    .eq("provider_subscription_id", subscription.id)
    .single();

  return data?.restaurant_id ?? null;
}

async function resolveRestaurantIdFromPayment(
  supabase: SupabaseClient,
  payment: RazorpayPaymentEntity,
  subscription?: RazorpaySubscriptionEntity
): Promise<string | null> {
  if (payment.notes?.restaurant_id) {
    return payment.notes.restaurant_id;
  }

  if (subscription) {
    return resolveRestaurantId(supabase, subscription);
  }

  return null;
}

/** Mark subscription active after auth or activation. */
export async function handleSubscriptionActive(
  supabase: SupabaseClient,
  subscription: RazorpaySubscriptionEntity
): Promise<void> {
  const restaurantId = await resolveRestaurantId(supabase, subscription);
  if (!restaurantId) {
    console.warn(
      `Razorpay webhook: no restaurant for subscription ${subscription.id}`
    );
    return;
  }

  await supabase
    .from("subscriptions")
    .update(periodUpdateFields(subscription))
    .eq("restaurant_id", restaurantId);

  await writeAuditLog({
    action: "billing.subscription_activated",
    entityType: "restaurant",
    entityId: restaurantId,
    metadata: { provider: "razorpay", subscriptionId: subscription.id },
  });
}

export async function handleSubscriptionCharged(
  supabase: SupabaseClient,
  subscription: RazorpaySubscriptionEntity,
  payment: RazorpayPaymentEntity
): Promise<void> {
  const restaurantId = await resolveRestaurantId(supabase, subscription);
  if (!restaurantId) return;

  await supabase
    .from("subscriptions")
    .update(periodUpdateFields(subscription))
    .eq("restaurant_id", restaurantId);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .single();

  if (sub) {
    await recordPayment({
      subscriptionId: sub.id,
      provider: "razorpay",
      providerPaymentId: payment.id,
      providerInvoiceId: payment.invoice_id,
      amount: payment.amount,
      currency: payment.currency.toUpperCase(),
      status: "paid",
    });
  }

  await writeAuditLog({
    action: "billing.payment_received",
    entityType: "restaurant",
    entityId: restaurantId,
    metadata: {
      provider: "razorpay",
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
    },
  });
}

export async function handlePaymentFailed(
  supabase: SupabaseClient,
  payment: RazorpayPaymentEntity,
  subscription?: RazorpaySubscriptionEntity
): Promise<void> {
  const restaurantId = await resolveRestaurantIdFromPayment(
    supabase,
    payment,
    subscription
  );
  if (!restaurantId) return;

  await updateSubscriptionStatus(restaurantId, "past_due");

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("restaurant_id", restaurantId)
    .single();

  if (sub) {
    await recordPayment({
      subscriptionId: sub.id,
      provider: "razorpay",
      providerPaymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency.toUpperCase(),
      status: "failed",
      failureReason: payment.error_description,
    });
  }

  await writeAuditLog({
    action: "billing.payment_failed",
    entityType: "restaurant",
    entityId: restaurantId,
    metadata: {
      provider: "razorpay",
      paymentId: payment.id,
      reason: payment.error_description,
    },
  });
}

export async function processRazorpayWebhookEvent(
  supabase: SupabaseClient,
  event: RazorpayWebhookEvent
): Promise<void> {
  switch (event.event) {
    case "subscription.authenticated":
    case "subscription.activated": {
      const subscription = event.payload.subscription?.entity;
      if (subscription) {
        await handleSubscriptionActive(supabase, subscription);
      }
      break;
    }

    case "subscription.charged": {
      const subscription = event.payload.subscription?.entity;
      const payment = event.payload.payment?.entity;
      if (subscription && payment) {
        await handleSubscriptionCharged(supabase, subscription, payment);
      }
      break;
    }

    case "subscription.pending": {
      const subscription = event.payload.subscription?.entity;
      if (subscription) {
        const restaurantId = await resolveRestaurantId(supabase, subscription);
        if (restaurantId) {
          await updateSubscriptionStatus(restaurantId, "past_due");
        }
      }
      break;
    }

    case "subscription.halted":
    case "subscription.cancelled": {
      const subscription = event.payload.subscription?.entity;
      if (subscription) {
        const restaurantId = await resolveRestaurantId(supabase, subscription);
        if (restaurantId) {
          await updateSubscriptionStatus(restaurantId, "cancelled", {
            cancelled_at: new Date().toISOString(),
          });
          await writeAuditLog({
            action: "billing.subscription_cancelled",
            entityType: "restaurant",
            entityId: restaurantId,
            metadata: {
              provider: "razorpay",
              event: event.event,
              subscriptionId: subscription.id,
            },
          });
        }
      }
      break;
    }

    case "payment.failed": {
      const payment = event.payload.payment?.entity;
      if (payment) {
        await handlePaymentFailed(
          supabase,
          payment,
          event.payload.subscription?.entity
        );
      }
      break;
    }

    default:
      console.log(`Unhandled Razorpay event type: ${event.event}`);
  }
}
