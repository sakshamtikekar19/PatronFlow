import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { buildReviewUrl } from "@/lib/review-url";

export default async function OnboardingPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  if (restaurant.onboarded) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <OnboardingWizard
        restaurant={restaurant}
        reviewUrl={buildReviewUrl(restaurant.id)}
      />
    </div>
  );
}
