import { PageHeader } from "@/components/page-header";
import { AuditLogTable } from "@/components/admin/audit-log-table";
import { getAuditLogs } from "@/lib/queries/admin";

export default async function AdminAuditPage() {
  const logs = await getAuditLogs();

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <PageHeader
        title="Audit Logs"
        description="Important platform actions performed by super administrators."
      />

      <AuditLogTable logs={logs} />
    </div>
  );
}
