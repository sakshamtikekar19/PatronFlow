import { redirect } from "next/navigation";
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
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Guest Recovery
        </h1>
        <p className="mt-1 text-neutral-500">
          Turn negative experiences into recovered customers. Follow up on every
          unhappy guest.
        </p>
      </div>
      <RecoveryPageClient cases={cases} analytics={analytics} />
    </div>
  );
}
