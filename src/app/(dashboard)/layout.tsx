import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getSubscriptionStatus } from "@/lib/billing";
import { TrialBanner } from "@/components/billing/trial-banner";

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

  const restaurant = await getRestaurantForUser();

  // First-time owners must complete onboarding before using the dashboard.
  if (restaurant && !restaurant.onboarded) {
    redirect("/onboarding");
  }

  // Check subscription status
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  const isBillingPage = pathname.startsWith("/billing");

  let subscriptionStatus = null;
  if (restaurant) {
    subscriptionStatus = await getSubscriptionStatus(restaurant.id);

    // If subscription is expired and not on billing page, redirect to billing
    if (!subscriptionStatus.isActive && !isBillingPage) {
      redirect("/billing");
    }
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
