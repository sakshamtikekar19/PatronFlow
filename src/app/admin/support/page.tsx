import { PageHeader } from "@/components/page-header";
import { SupportRequestsTable } from "@/components/admin/support-table";
import { getSupportRequests } from "@/lib/queries/admin";

export default async function AdminSupportPage() {
  const requests = await getSupportRequests();

  const contactCount = requests.filter((r) => r.type === "contact").length;
  const bugCount = requests.filter((r) => r.type === "bug").length;
  const featureCount = requests.filter((r) => r.type === "feature").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Support"
        description="Contact requests, bug reports, and feature requests from restaurants and visitors."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Contact requests</p>
          <p className="mt-1 text-2xl font-semibold">{contactCount}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Bug reports</p>
          <p className="mt-1 text-2xl font-semibold">{bugCount}</p>
        </div>
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Feature requests</p>
          <p className="mt-1 text-2xl font-semibold">{featureCount}</p>
        </div>
      </div>

      <SupportRequestsTable requests={requests} />
    </div>
  );
}
