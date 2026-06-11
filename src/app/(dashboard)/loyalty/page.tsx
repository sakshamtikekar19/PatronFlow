import { redirect } from "next/navigation";
import { LoyaltyPageClient } from "@/components/loyalty/loyalty-page-client";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import {
  getLoyaltyStats,
  getLoyaltyRules,
  getLoyaltyCustomers,
  getLoyaltyTransactions,
} from "@/lib/queries/loyalty";

export default async function LoyaltyPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const [stats, rules, customers, transactions] = await Promise.all([
    getLoyaltyStats(restaurant.id),
    getLoyaltyRules(restaurant.id),
    getLoyaltyCustomers(restaurant.id),
    getLoyaltyTransactions(restaurant.id),
  ]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">
          Loyalty Program
        </h1>
        <p className="mt-1 text-neutral-500">
          Reward your regulars with points and keep them coming back.
        </p>
      </div>
      <LoyaltyPageClient
        stats={stats}
        rules={rules}
        customers={customers}
        transactions={transactions}
      />
    </div>
  );
}
