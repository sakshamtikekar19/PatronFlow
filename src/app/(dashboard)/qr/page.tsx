import { redirect } from "next/navigation";
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
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">QR Codes</h1>
        <p className="mt-1 text-neutral-500">
          Generate and manage QR codes that send guests to your feedback page.
        </p>
      </div>

      {/* Main restaurant QR */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">
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
        <h2 className="text-lg font-semibold text-neutral-900">
          Table QR Codes
        </h2>
        <TableQrManager
          restaurantName={restaurant.name}
          initialTableQrs={tableQrs}
        />
      </section>

      {/* Per-table analytics */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-neutral-900">
          QR Performance
        </h2>
        <TableAnalyticsTable data={analytics} />
      </section>
    </div>
  );
}
