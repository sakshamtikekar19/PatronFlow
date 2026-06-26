import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { ensureRestaurantForUser } from "@/lib/queries/restaurant";
import { getBillingData, getActivePlans } from "@/lib/queries/billing";
import { getSubscriptionStatus, getAvailableProviders } from "@/lib/billing";
import {
  getCountryFromHeaders,
  resolveSubscriptionCurrency,
} from "@/lib/billing/subscription-currency";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { BillingPageClient } from "@/components/billing/billing-page-client";

export const metadata: Metadata = {
  title: "Billing",
};

interface BillingPageProps {
  searchParams: Promise<{
    success?: string;
    cancelled?: string;
  }>;
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  const restaurant = await ensureRestaurantForUser();

  if (!restaurant) {
    redirect("/login?error=restaurant_setup_failed");
  }

  const [billingData, plans, subscriptionStatus] = await Promise.all([
    getBillingData(restaurant.id),
    getActivePlans(),
    getSubscriptionStatus(restaurant.id),
  ]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const availableProviders = getAvailableProviders();
  const params = await searchParams;
  const headersList = await headers();
  const checkoutCurrency = resolveSubscriptionCurrency(
    getCountryFromHeaders(headersList)
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description={
          subscriptionStatus.isActive
            ? "Manage your subscription and payment methods"
            : "Your trial has ended. Subscribe to restore access to PatronFlow."
        }
      />

      {!subscriptionStatus.isActive && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800">
          Your subscription is inactive. Upgrade below to unlock your dashboard,
          customers, and all other features.
        </div>
      )}

      {params.success && (
        <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Payment successful! Your subscription is now active.
        </div>
      )}

      {params.cancelled && (
        <div className="rounded-xl bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
          Payment was cancelled. You can try again anytime.
        </div>
      )}

      <BillingPageClient
        subscription={billingData.subscription}
        plan={billingData.plan}
        payments={billingData.payments}
        plans={plans}
        subscriptionStatus={subscriptionStatus}
        availableProviders={availableProviders}
        checkoutCurrency={checkoutCurrency}
        userEmail={user?.email ?? ""}
        restaurantName={restaurant.name}
      />
    </div>
  );
}
