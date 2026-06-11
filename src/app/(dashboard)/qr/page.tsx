import { redirect } from "next/navigation";
import { PageHeader } from "@/components/page-header";
import { QrCodeCard } from "@/components/qr/qr-code-card";
import { TableQrManager } from "@/components/qr/table-qr-manager";
import { TableAnalyticsTable } from "@/components/qr/table-analytics-table";
import { getRestaurantForUser } from "@/lib/queries/restaurant";
import { getTableQrs, getTableAnalytics } from "@/lib/queries/qr";
import { buildReviewUrl } from "@/lib/review-url";

export default async function QrPage() {
  const restaurant = await getRestaurantForUser();

  if (!restaurant) {
    redirect("/login");
  }

  const [tableQrs, analytics] = await Promise.all([
    getTableQrs(restaurant.id),
    getTableAnalytics(restaurant.id),
  ]);

  const mainUrl = buildReviewUrl(restaurant.slug ?? restaurant.id);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <PageHeader
        title="QR Codes"
        description="Generate and manage QR codes that send guests to your feedback page."
      />

      {/* Main restaurant QR */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Main Feedback QR
        </h2>
        <QrCodeCard
          url={mainUrl}
          title={restaurant.name}
          subtitle="Your primary feedback link"
          filename={restaurant.name}
        />
      </section>

      {/* Table-specific QRs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          Table QR Codes
        </h2>
        <TableQrManager
          restaurantName={restaurant.name}
          initialTableQrs={tableQrs}
        />
      </section>

      {/* Per-table analytics */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">
          QR Performance
        </h2>
        <TableAnalyticsTable data={analytics} />
      </section>
    </div>
  );
}
