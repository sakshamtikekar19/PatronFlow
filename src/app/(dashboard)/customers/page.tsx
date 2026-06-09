import { CustomersPageClient } from "@/components/customers/customers-page-client";
import { ExportButton } from "@/components/export-button";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getCustomersWithStats } from "@/lib/queries/customers";
import { segmentCustomers } from "@/lib/segments";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const customers = await getCustomersWithStats(restaurant.id);
  const segmented = segmentCustomers(customers);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Customers</h1>
          <p className="mt-1 text-neutral-500">
            Manage your customer database and view feedback history.
          </p>
        </div>
        <ExportButton endpoint="/api/export/customers" label="Export Customers" />
      </div>
      <CustomersPageClient
        initialCustomers={segmented}
        restaurantId={restaurant.id}
      />
    </div>
  );
}
