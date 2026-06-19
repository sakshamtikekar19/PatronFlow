import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { createClient } from "@/lib/supabase/server";
import { ensureRestaurantForUser } from "@/lib/queries/restaurant";
import { getSubscriptionStatus } from "@/lib/billing";
import { buildReviewUrl } from "@/lib/review-url";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const restaurant = await ensureRestaurantForUser();

  if (!restaurant) {
    redirect("/login?error=restaurant_setup_failed");
  }

  const subscriptionStatus = await getSubscriptionStatus(restaurant.id);
  if (!subscriptionStatus.isActive) {
    redirect("/billing");
  }

  if (restaurant.onboarded) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <OnboardingWizard
        restaurant={restaurant}
        reviewUrl={buildReviewUrl(restaurant.slug ?? restaurant.id)}
      />
    </div>
  );
}
