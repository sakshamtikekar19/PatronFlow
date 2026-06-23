import { PageHeader } from "@/components/page-header";
import { SupportRequestsTable } from "@/components/admin/support-table";
import { getSupportRequests } from "@/lib/queries/admin";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AdminSupportPageProps {
  searchParams: Promise<{ type?: string }>;
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "contact", label: "Contact" },
  { id: "bug", label: "Bugs" },
  { id: "feature", label: "Features" },
] as const;

export default async function AdminSupportPage({
  searchParams,
}: AdminSupportPageProps) {
  const { type } = await searchParams;
  const allRequests = await getSupportRequests();
  const activeFilter = FILTERS.some((f) => f.id === type) ? type : "all";

  const requests =
    activeFilter === "all"
      ? allRequests
      : allRequests.filter((r) => r.type === activeFilter);

  const contactCount = allRequests.filter((r) => r.type === "contact").length;
  const bugCount = allRequests.filter((r) => r.type === "bug").length;
  const featureCount = allRequests.filter((r) => r.type === "feature").length;
  const openCount = allRequests.filter((r) => r.status === "open").length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Support"
        description="Contact requests, bug reports, and feature requests from the landing page and restaurant settings."
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-card p-5 shadow-card">
          <p className="text-sm text-muted-foreground">Open tickets</p>
          <p className="mt-1 text-2xl font-semibold">{openCount}</p>
        </div>
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

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.id}
            href={
              filter.id === "all"
                ? "/admin/support"
                : `/admin/support?type=${filter.id}`
            }
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              activeFilter === filter.id
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <SupportRequestsTable requests={requests} />
    </div>
  );
}
