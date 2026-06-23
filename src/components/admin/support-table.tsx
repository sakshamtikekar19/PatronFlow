"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { updateSupportRequestStatus } from "@/lib/actions/admin";
import type { SupportRequestRow } from "@/lib/queries/admin";

const statusOptions = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

function typeLabel(type: SupportRequestRow["type"]) {
  if (type === "bug") return "Bug report";
  if (type === "feature") return "Feature request";
  return "Contact";
}

interface SupportRequestsTableProps {
  requests: SupportRequestRow[];
}

export function SupportRequestsTable({ requests }: SupportRequestsTableProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
        No support requests yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="overflow-hidden rounded-2xl border-0 bg-card shadow-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <Badge variant="outline">{typeLabel(request.type)}</Badge>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{request.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {request.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{request.subject}</div>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {request.message}
                  </p>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={request.status}
                    onValueChange={(value) => {
                      setError(null);
                      startTransition(async () => {
                        const result = await updateSupportRequestStatus(
                          request.id,
                          value as (typeof statusOptions)[number]
                        );
                        if (result.error) setError(result.error);
                      });
                    }}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(request.createdAt).toLocaleDateString("en-IN")}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" disabled={pending}>
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
