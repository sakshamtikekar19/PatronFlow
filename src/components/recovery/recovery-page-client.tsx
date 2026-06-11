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
  const [commentCase, setCommentCase] = useState<RecoveryCase | null>(null);

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
        <>
        <Card className="hidden rounded-2xl border-0 bg-card shadow-card md:block">
          <CardContent className="overflow-x-auto p-0">
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
                      <div className="font-medium text-foreground">
                        {c.customer?.name ?? "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground md:hidden">
                        {c.customer?.phone}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {c.customer?.phone ?? "—"}
                    </TableCell>
                    <TableCell>
                      <RatingStars rating={c.rating} size="sm" />
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        {c.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      {c.comment ? (
                        <button
                          type="button"
                          onClick={() => setCommentCase(c)}
                          title="Click to read full comment"
                          className="block max-w-[240px] line-clamp-2 break-words text-left text-muted-foreground hover:text-foreground hover:underline"
                        >
                          {c.comment}
                        </button>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell whitespace-nowrap text-muted-foreground">
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
                          aria-label="Internal notes"
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
        <div className="space-y-3 md:hidden">
          {cases.map((c) => (
            <Card
              key={c.id}
              className="rounded-2xl border-0 bg-card shadow-card"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">
                      {c.customer?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.customer?.phone}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={cn("shrink-0 border-0", STATUS_STYLES[c.recovery_status])}
                  >
                    {STATUS_LABEL[c.recovery_status]}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <RatingStars rating={c.rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    {formatDate(c.created_at)}
                  </span>
                </div>
                {c.category && (
                  <span className="mt-2 inline-block rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {c.category}
                  </span>
                )}
                {c.comment && (
                  <button
                    type="button"
                    onClick={() => setCommentCase(c)}
                    className="mt-2 block w-full text-left text-sm text-muted-foreground hover:text-foreground"
                  >
                    {c.comment}
                  </button>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
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
                    aria-label="Internal notes"
                    onClick={() => openNotes(c)}
                  >
                    <NotebookPen className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        </>
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

      <Dialog
        open={commentCase !== null}
        onOpenChange={(open) => !open && setCommentCase(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {commentCase?.customer?.name ?? "Guest"} feedback
            </DialogTitle>
            <DialogDescription>
              {commentCase ? formatDate(commentCase.created_at) : ""}
              {commentCase?.category ? ` · ${commentCase.category}` : ""}
            </DialogDescription>
          </DialogHeader>
          {commentCase && (
            <div className="space-y-4">
              <RatingStars rating={commentCase.rating} size="sm" />
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                {commentCase.comment}
              </p>
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setCommentCase(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
