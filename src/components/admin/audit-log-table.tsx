import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { AuditLogRow } from "@/lib/queries/admin";

const ACTION_LABELS: Record<string, string> = {
  "account.signup": "New signup",
  "account.delete": "Account deleted",
  "account.data_export": "Data exported",
  "restaurant.settings_update": "Settings updated",
  "restaurant.logo_upload": "Logo uploaded",
  "restaurant.logo_remove": "Logo removed",
  "restaurant.onboarding_complete": "Onboarding completed",
  "restaurant.suspend": "Restaurant suspended",
  "restaurant.unsuspend": "Restaurant unsuspended",
  "restaurant.delete": "Restaurant deleted",
  "restaurant.impersonate": "Login as owner",
  "subscription.checkout_started": "Checkout started",
  "subscription.cancel_requested": "Cancellation requested",
  "billing.subscription_activated": "Subscription activated",
  "billing.payment_received": "Payment received",
  "billing.payment_failed": "Payment failed",
  "billing.subscription_cancelled": "Subscription cancelled",
  "support.received": "Support request received",
  "support.update": "Support ticket updated",
};

function formatAction(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

interface AuditLogTableProps {
  logs: AuditLogRow[];
}

export function AuditLogTable({ logs }: AuditLogTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
        No audit logs yet. Platform actions will appear here as they happen.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>When</TableHead>
            <TableHead>Actor</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {new Date(log.createdAt).toLocaleString("en-IN")}
              </TableCell>
              <TableCell className="text-sm">
                {log.actorEmail ?? log.actorId ?? (
                  <Badge variant="outline">system</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium">{formatAction(log.action)}</div>
                <div className="text-xs text-muted-foreground">{log.action}</div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {log.entityType}
                {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ""}
              </TableCell>
              <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                {Object.keys(log.metadata).length > 0
                  ? JSON.stringify(log.metadata)
                  : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
