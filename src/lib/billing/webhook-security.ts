import type { SupabaseClient } from "@supabase/supabase-js";

interface SubscriptionRow {
  restaurant_id: string;
  provider_subscription_id: string | null;
}

/**
 * Resolve the restaurant for a Razorpay subscription webhook.
 * Provider subscription ID in our DB is authoritative; metadata is only used
 * for first-time binding when checkout has not yet stored the provider ID.
 */
export async function resolveRestaurantForRazorpaySubscription(
  supabase: SupabaseClient,
  subscription: { id: string; notes?: { restaurant_id?: string } | null }
): Promise<string | null> {
  const { data: byProvider } = await supabase
    .from("subscriptions")
    .select("restaurant_id, provider_subscription_id")
    .eq("provider_subscription_id", subscription.id)
    .maybeSingle();

  if (byProvider) {
    const noteId = subscription.notes?.restaurant_id;
    if (noteId && noteId !== byProvider.restaurant_id) {
      console.error("Razorpay webhook: notes.restaurant_id mismatch — using DB row", {
        subscriptionId: subscription.id,
        noteRestaurantId: noteId,
        dbRestaurantId: byProvider.restaurant_id,
      });
    }
    return byProvider.restaurant_id;
  }

  const noteRestaurantId = subscription.notes?.restaurant_id;
  if (!noteRestaurantId) return null;

  return validateRestaurantSubscriptionBind(
    supabase,
    noteRestaurantId,
    subscription.id,
    "razorpay"
  );
}

/**
 * Resolve the restaurant for a Stripe subscription webhook.
 */
export async function resolveRestaurantForStripeSubscription(
  supabase: SupabaseClient,
  subscription: { id: string; metadata?: { restaurant_id?: string } | null }
): Promise<string | null> {
  const { data: byProvider } = await supabase
    .from("subscriptions")
    .select("restaurant_id, provider_subscription_id")
    .eq("provider_subscription_id", subscription.id)
    .maybeSingle();

  if (byProvider) {
    const metaId = subscription.metadata?.restaurant_id;
    if (metaId && metaId !== byProvider.restaurant_id) {
      console.error("Stripe webhook: metadata.restaurant_id mismatch — using DB row", {
        subscriptionId: subscription.id,
        metaRestaurantId: metaId,
        dbRestaurantId: byProvider.restaurant_id,
      });
    }
    return byProvider.restaurant_id;
  }

  const metaRestaurantId = subscription.metadata?.restaurant_id;
  if (!metaRestaurantId) return null;

  return validateRestaurantSubscriptionBind(
    supabase,
    metaRestaurantId,
    subscription.id,
    "stripe"
  );
}

/**
 * Validate checkout.session.completed before activating a subscription.
 */
export async function validateStripeCheckoutSession(
  supabase: SupabaseClient,
  restaurantId: string,
  stripeSubscriptionId: string
): Promise<boolean> {
  const row = await getSubscriptionRow(supabase, restaurantId);
  if (!row) return false;

  if (
    row.provider_subscription_id &&
    row.provider_subscription_id !== stripeSubscriptionId
  ) {
    console.error("Stripe webhook: checkout session rejected — subscription id conflict", {
      restaurantId,
      existingProviderSubscriptionId: row.provider_subscription_id,
      incomingSubscriptionId: stripeSubscriptionId,
    });
    return false;
  }

  return true;
}

async function validateRestaurantSubscriptionBind(
  supabase: SupabaseClient,
  restaurantId: string,
  providerSubscriptionId: string,
  provider: "razorpay" | "stripe"
): Promise<string | null> {
  const row = await getSubscriptionRow(supabase, restaurantId);
  if (!row) {
    console.warn(`${provider} webhook: unknown restaurant in metadata`, {
      restaurantId,
      providerSubscriptionId,
    });
    return null;
  }

  if (
    row.provider_subscription_id &&
    row.provider_subscription_id !== providerSubscriptionId
  ) {
    console.error(`${provider} webhook: rejected metadata bind — subscription id conflict`, {
      restaurantId,
      existingProviderSubscriptionId: row.provider_subscription_id,
      incomingSubscriptionId: providerSubscriptionId,
    });
    return null;
  }

  return row.restaurant_id;
}

async function getSubscriptionRow(
  supabase: SupabaseClient,
  restaurantId: string
): Promise<SubscriptionRow | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("restaurant_id, provider_subscription_id")
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  return data;
}
