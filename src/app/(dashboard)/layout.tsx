import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { BillingOnlyLayout } from "@/components/layout/billing-only-layout";
import { createClient } from "@/lib/supabase/server";
import {
  ensureRestaurantForUser,
  getRestaurantForUser,
} from "@/lib/queries/restaurant";
import { getSubscriptionStatus } from "@/lib/billing";
import { TrialBanner } from "@/components/billing/trial-banner";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let restaurant = await getRestaurantForUser();
  if (!restaurant) {
    restaurant = await ensureRestaurantForUser();
  }

  // First-time owners must complete onboarding before using the dashboard.
  if (restaurant && !restaurant.onboarded) {
    redirect("/onboarding");
  }

  // Check subscription status
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isBillingPage = pathname.startsWith("/billing");

  let subscriptionStatus = null;
  let isLocked = false;
  if (restaurant) {
    void createAdminClient()
      .from("restaurants")
      .update({ last_active_at: new Date().toISOString() })
      .eq("id", restaurant.id);

    subscriptionStatus = await getSubscriptionStatus(restaurant.id);
    isLocked = !subscriptionStatus.isActive;

    if (isLocked && !isBillingPage) {
      redirect("/billing");
    }
  }

  if (isLocked) {
    return (
      <BillingOnlyLayout userEmail={user.email}>
        {children}
      </BillingOnlyLayout>
    );
  }

  return (
    <DashboardLayout
      restaurantName={restaurant?.name}
      restaurantLogo={restaurant?.logo ?? null}
      userEmail={user.email}
    >
      {subscriptionStatus?.status === "trialing" &&
        subscriptionStatus.trialDaysRemaining !== null && (
          <TrialBanner daysRemaining={subscriptionStatus.trialDaysRemaining} />
        )}
      {children}
    </DashboardLayout>
  );
}
