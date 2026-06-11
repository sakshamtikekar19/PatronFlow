import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { RecoveryPageClient } from "@/components/recovery/recovery-page-client";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import {
  getRecoveryCases,
  getRecoveryAnalytics,
} from "@/lib/queries/recovery";

export default async function RecoveryPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const [cases, analytics] = await Promise.all([
    getRecoveryCases(restaurant.id),
    getRecoveryAnalytics(restaurant.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        title="Guest Recovery"
        description="Turn negative experiences into recovered customers. Follow up on every unhappy guest."
      />
      <RecoveryPageClient cases={cases} analytics={analytics} />
    </div>
  );
}
