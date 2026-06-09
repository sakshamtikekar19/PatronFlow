"use client";

import { useState, useTransition } from "react";
import { HeartHandshake, Phone, NotebookPen } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RatingStars } from "@/components/rating-stars";
import { EmptyState } from "@/components/empty-state";
import { StatCard } from "@/components/stat-card";
import { formatDate } from "@/lib/utils";
import {
  updateRecoveryStatus,
  updateRecoveryNotes,
} from "@/lib/actions/recovery";
import type { RecoveryCase, RecoveryAnalytics, RecoveryStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<RecoveryStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  contacted: "bg-blue-50 text-blue-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

const STATUS_LABEL: Record<RecoveryStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  resolved: "Resolved",
};

interface RecoveryPageClientProps {
  cases: RecoveryCase[];
  analytics: RecoveryAnalytics;
}

export function RecoveryPageClient({
  cases,
  analytics,
}: RecoveryPageClientProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notesCase, setNotesCase] = useState<RecoveryCase | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const setStatus = (id: string, status: RecoveryStatus) => {
    setPendingId(id);
    startTransition(async () => {
      const res = await updateRecoveryStatus(id, status);
      if (res.error) toast.error(res.error);
      else toast.success(`Marked ${STATUS_LABEL[status].toLowerCase()}`);
      setPendingId(null);
    });
  };

  const openNotes = (c: RecoveryCase) => {
    setNotesCase(c);
    setNotesValue(c.recovery_notes ?? "");
  };

  const saveNotes = () => {
    if (!notesCase) return;
    startTransition(async () => {
      const res = await updateRecoveryNotes(notesCase.id, notesValue);
      if (res.error) toast.error(res.error);
      else {
        toast.success("Notes saved");
        setNotesCase(null);
      }
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Negative Feedback"
          value={analytics.totalNegative}
          icon="⚠️"
        />
        <StatCard
          title="Recovered Customers"
          value={analytics.recovered}
          icon="💚"
        />
        <StatCard
          title="Recovery Rate"
          value={`${analytics.recoveryRate}%`}
          icon="📈"
        />
        <StatCard title="Open Cases" value={analytics.openCases} icon="📨" />
      </div>

      {cases.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake className="h-6 w-6" />}
          title="No negative feedback to recover"
          description="When a guest leaves a rating of 3 stars or less, it will appear here so you can follow up and win them back."
        />
      ) : (
        <Card className="border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-2xl">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Phone</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="hidden lg:table-cell">Issue</TableHead>
                  <TableHead className="hidden xl:table-cell">Comment</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="font-medium text-neutral-900">
                        {c.customer?.name ?? "Unknown"}
                      </div>
                      <div className="text-xs text-neutral-500 md:hidden">
                        {c.customer?.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-neutral-600">
                      {c.customer?.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={c.rating} size="sm" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
                        {c.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell max-w-[220px]">
                      <span className="line-clamp-2 text-neutral-600">
                        {c.comment || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-neutral-500">
                      {formatDate(c.created_at)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn("border-0", STATUS_STYLES[c.recovery_status])}
                      >
                        {STATUS_LABEL[c.recovery_status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.recovery_status !== "contacted" &&
                          c.recovery_status !== "resolved" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isPending && pendingId === c.id}
                              onClick={() => setStatus(c.id, "contacted")}
                            >
                              <Phone className="h-3.5 w-3.5" />
                              Contacted
                            </Button>
                          )}
                        {c.recovery_status !== "resolved" && (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending && pendingId === c.id}
                            onClick={() => setStatus(c.id, "resolved")}
                          >
                            Resolve
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          title="Internal notes"
                          onClick={() => openNotes(c)}
                        >
                          <NotebookPen className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={notesCase !== null}
        onOpenChange={(open) => !open && setNotesCase(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Private notes for {notesCase?.customer?.name ?? "this guest"}. Only
              your team can see these.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="e.g. Called guest, offered a complimentary dessert on next visit."
            rows={5}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setNotesCase(null)}>
              Cancel
            </Button>
            <Button onClick={saveNotes} disabled={isPending}>
              {isPending ? "Saving..." : "Save notes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
