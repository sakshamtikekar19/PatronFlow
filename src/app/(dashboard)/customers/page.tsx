import { CustomersPageClient } from "@/components/customers/customers-page-client";
import { ExportButton } from "@/components/export-button";
import { PageHeader } from "@/components/page-header";
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
      <PageHeader
        title="Customers"
        description="Manage your customer database and view feedback history."
        actions={
          <ExportButton endpoint="/api/export/customers" label="Export Customers" />
        }
      />
      <CustomersPageClient
        initialCustomers={segmented}
        restaurantId={restaurant.id}
      />
    </div>
  );
}
