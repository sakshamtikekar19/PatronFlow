"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { updateSupportRequest } from "@/lib/actions/admin";
import type { SupportRequestRow } from "@/lib/queries/admin";

const statusOptions = [
  "open",
  "in_progress",
  "resolved",
  "closed",
] as const;

type SupportStatus = (typeof statusOptions)[number];

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
  const [selected, setSelected] = useState<SupportRequestRow | null>(null);
  const [status, setStatus] = useState<SupportStatus>("open");
  const [adminNotes, setAdminNotes] = useState("");

  function openRequest(request: SupportRequestRow) {
    setSelected(request);
    setStatus(request.status);
    setAdminNotes(request.adminNotes ?? "");
    setError(null);
  }

  function saveRequest() {
    if (!selected) return;
    setError(null);
    startTransition(async () => {
      const result = await updateSupportRequest(
        selected.id,
        status,
        adminNotes
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setSelected(null);
    });
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-sm text-muted-foreground shadow-card">
        No support requests yet. Submissions from the contact form and
        restaurant settings will appear here.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {error && !selected && (
          <p className="text-sm text-destructive">{error}</p>
        )}
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
                    <Badge
                      variant={
                        request.status === "open"
                          ? "default"
                          : request.status === "resolved" ||
                              request.status === "closed"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {request.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString("en-IN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openRequest(request)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl sm:max-w-lg">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{typeLabel(selected.type)}</Badge>
                  <Badge variant="secondary">
                    {selected.status.replace("_", " ")}
                  </Badge>
                </div>
                <div className="grid gap-2 rounded-xl bg-muted/50 p-4">
                  <p>
                    <span className="text-muted-foreground">From: </span>
                    {selected.name} ({selected.email})
                  </p>
                  <p>
                    <span className="text-muted-foreground">Submitted: </span>
                    {new Date(selected.createdAt).toLocaleString("en-IN")}
                  </p>
                  {selected.restaurantId && (
                    <p>
                      <span className="text-muted-foreground">
                        Restaurant:{" "}
                      </span>
                      <Link
                        href={`/admin/restaurants/${selected.restaurantId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        View restaurant
                      </Link>
                    </p>
                  )}
                </div>
                <div>
                  <Label className="text-muted-foreground">Message</Label>
                  <p className="mt-2 whitespace-pre-wrap rounded-xl border border-border bg-card p-4">
                    {selected.message}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(value) =>
                      setStatus(value as SupportStatus)
                    }
                  >
                    <SelectTrigger id="support-status" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option.replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-notes">Admin notes</Label>
                  <Textarea
                    id="support-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="Internal notes (not visible to the submitter)"
                    className="rounded-xl"
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={saveRequest}
                  disabled={pending}
                  className="rounded-xl"
                >
                  {pending ? "Saving..." : "Save changes"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
