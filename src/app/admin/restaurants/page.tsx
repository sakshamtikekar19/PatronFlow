import { Suspense } from "react";
import { PageHeader } from "@/components/page-header";
import { AdminRestaurantSearch } from "@/components/admin/restaurant-search";
import { AdminRestaurantTable } from "@/components/admin/restaurant-table";
import { getAdminRestaurants } from "@/lib/queries/admin";
import { Skeleton } from "@/components/ui/skeleton";

interface RestaurantsPageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function AdminRestaurantsPage({
  searchParams,
}: RestaurantsPageProps) {
  const { search } = await searchParams;
  const restaurants = await getAdminRestaurants(search);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Restaurant Management"
        description="Search restaurants, review health scores, and manage platform access."
      />

      <Suspense fallback={<Skeleton className="h-10 w-full max-w-md rounded-full" />}>
        <AdminRestaurantSearch initialSearch={search} />
      </Suspense>

      <AdminRestaurantTable restaurants={restaurants} />
    </div>
  );
}
