import { SettingsTabs } from "@/components/settings/settings-tabs";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { buildReviewUrl } from "@/lib/review-url";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="mt-1 text-neutral-500">
          Manage your restaurant profile, brand, and guest growth settings.
        </p>
      </div>
      <SettingsTabs
        restaurant={restaurant}
        reviewUrl={buildReviewUrl(restaurant.slug ?? restaurant.id)}
        userEmail={user?.email}
      />
    </div>
  );
}
