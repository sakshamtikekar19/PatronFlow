import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantForUser } from "@/lib/queries/restaurant";

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

  return (
    <DashboardLayout
      restaurantName={restaurant?.name}
      restaurantLogo={restaurant?.logo ?? null}
      userEmail={user.email}
    >
      {children}
    </DashboardLayout>
  );
}
