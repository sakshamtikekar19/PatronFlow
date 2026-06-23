import { PageHeader } from "@/components/page-header";
import { AdminStatGrid } from "@/components/admin/admin-stat-grid";
import { getAdminOverview } from "@/lib/queries/admin";

export default async function AdminOverviewPage() {
  const overview = await getAdminOverview();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Platform Overview"
        description="Monitor PatronFlow growth, engagement, and restaurant health across the platform."
      />

      <AdminStatGrid
        stats={[
          {
            title: "Total Restaurants",
            value: overview.totalRestaurants,
            growth: overview.growth.restaurants,
            icon: "🏪",
          },
          {
            title: "Active Restaurants",
            value: overview.activeRestaurants,
            growth: overview.growth.activeRestaurants,
            icon: "✅",
          },
          {
            title: "Total Feedback",
            value: overview.totalFeedback,
            growth: overview.growth.feedback,
            icon: "📝",
          },
          {
            title: "Total Customers",
            value: overview.totalCustomers,
            growth: overview.growth.customers,
            icon: "👥",
          },
          {
            title: "Review Clicks",
            value: overview.totalReviewClicks,
            growth: overview.growth.reviewClicks,
            icon: "🔗",
          },
          {
            title: "Total Events",
            value: overview.totalEvents,
            growth: overview.growth.events,
            icon: "📅",
          },
        ]}
      />
    </div>
  );
}
