import { PageHeader } from "@/components/page-header";
import { AdminStatGrid } from "@/components/admin/admin-stat-grid";
import { getAdminRevenue } from "@/lib/queries/admin";

function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function AdminRevenuePage() {
  const revenue = await getAdminRevenue();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Revenue"
        description="Subscription metrics, MRR, ARR, trials, and churn."
      />

      <AdminStatGrid
        stats={[
          { title: "MRR", value: formatINR(revenue.mrr), icon: "₹" },
          { title: "ARR", value: formatINR(revenue.arr), icon: "📈" },
          {
            title: "Active Subscriptions",
            value: revenue.activeSubscriptions,
            icon: "✅",
          },
          { title: "Trial Users", value: revenue.trialUsers, icon: "⏳" },
          {
            title: "Churn (30d)",
            value: `${revenue.churnRate}%`,
            icon: "📉",
          },
          {
            title: "Cancelled (30d)",
            value: revenue.cancelledLast30Days,
            icon: "❌",
          },
        ]}
      />
    </div>
  );
}
