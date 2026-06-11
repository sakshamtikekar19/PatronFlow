"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Gift,
  Plus,
  Trash2,
  Star,
  Coins,
  Search,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Settings2,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createLoyaltyRule,
  deleteLoyaltyRule,
  addLoyaltyTransaction,
} from "@/lib/actions/loyalty";
import type {
  LoyaltyRule,
  LoyaltyStats,
  LoyaltyCustomer,
  LoyaltyTransactionType,
  LoyaltyTransactionWithCustomer,
} from "@/types";
import { toast } from "sonner";

interface LoyaltyPageClientProps {
  stats: LoyaltyStats;
  rules: LoyaltyRule[];
  customers: LoyaltyCustomer[];
  transactions: LoyaltyTransactionWithCustomer[];
}

type HistoryFilter = "all" | LoyaltyTransactionType;

const TXN_DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export function LoyaltyPageClient({
  stats,
  rules,
  customers,
  transactions,
}: LoyaltyPageClientProps) {
  const [isPending, startTransition] = useTransition();

  // Top-level view: Members vs Points
  const [view, setView] = useState<"members" | "points">("members");

  // Member search
  const [search, setSearch] = useState("");
  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  // History filters
  const [historyType, setHistoryType] = useState<HistoryFilter>("all");
  const [historySearch, setHistorySearch] = useState("");
  const filteredTransactions = useMemo(() => {
    const q = historySearch.trim().toLowerCase();
    return transactions.filter((t) => {
      if (historyType !== "all" && t.transaction_type !== historyType) {
        return false;
      }
      if (!q) return true;
      return (
        t.customerName.toLowerCase().includes(q) ||
        (t.customerPhone ?? "").toLowerCase().includes(q)
      );
    });
  }, [transactions, historyType, historySearch]);

  // Reward dialog state
  const [rewardOpen, setRewardOpen] = useState(false);
  const [rewardName, setRewardName] = useState("");
  const [rewardPoints, setRewardPoints] = useState("");
  const [rewardDesc, setRewardDesc] = useState("");

  // Points dialog state
  const [pointsCustomer, setPointsCustomer] = useState<LoyaltyCustomer | null>(
    null
  );
  const [pointsType, setPointsType] = useState<LoyaltyTransactionType>("earned");
  const [pointsAmount, setPointsAmount] = useState("");
  const [pointsNotes, setPointsNotes] = useState("");

  const submitReward = () => {
    startTransition(async () => {
      const res = await createLoyaltyRule({
        rewardName,
        pointsRequired: Number(rewardPoints),
        rewardDescription: rewardDesc,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Reward created");
      setRewardName("");
      setRewardPoints("");
      setRewardDesc("");
      setRewardOpen(false);
    });
  };

  const removeReward = (id: string) => {
    startTransition(async () => {
      const res = await deleteLoyaltyRule(id);
      if (res.error) toast.error(res.error);
      else toast.success("Reward removed");
    });
  };

  const openPoints = (c: LoyaltyCustomer, type: LoyaltyTransactionType) => {
    setPointsCustomer(c);
    setPointsType(type);
    setPointsAmount("");
    setPointsNotes("");
  };

  const submitPoints = () => {
    if (!pointsCustomer) return;
    startTransition(async () => {
      const res = await addLoyaltyTransaction({
        customerId: pointsCustomer.id,
        points: Number(pointsAmount),
        type: pointsType,
        notes: pointsNotes,
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
      toast.success(
        pointsType === "earned" ? "Points added" : "Points redeemed"
      );
      setPointsCustomer(null);
    });
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Members" value={stats.activeMembers} icon="👥" />
        <StatCard title="Points Issued" value={stats.pointsIssued} icon="✨" />
        <StatCard
          title="Points Redeemed"
          value={stats.pointsRedeemed}
          icon="🎁"
        />
        <StatCard title="Active Rewards" value={stats.rewardCount} icon="🏆" />
      </div>

      {/* View switcher */}
      <div className="inline-flex gap-1 rounded-xl bg-neutral-100 p-1">
        {(
          [
            { id: "members", label: "Members", icon: Users },
            { id: "points", label: "Points", icon: Coins },
          ] as const
        ).map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              view === id
                ? "bg-white text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
                : "text-neutral-500 hover:text-neutral-900"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Rewards management — Points view */}
      {view === "points" && (
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Rewards</h2>
          <Button onClick={() => setRewardOpen(true)}>
            <Plus className="h-4 w-4" />
            Create reward
          </Button>
        </div>

        {rules.length === 0 ? (
          <EmptyState
            icon={<Gift className="h-6 w-6" />}
            title="No rewards yet"
            description="Create rewards like a free dessert or 20% off to give members something to redeem their points for."
            action={
              <Button onClick={() => setRewardOpen(true)}>
                <Plus className="h-4 w-4" />
                Create reward
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rules.map((rule) => (
              <Card
                key={rule.id}
                className="border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-2xl"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                        <Gift className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-medium text-neutral-900">
                          {rule.reward_name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {rule.points_required} points
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeReward(rule.id)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-neutral-400" />
                    </Button>
                  </div>
                  {rule.reward_description && (
                    <p className="mt-3 text-sm text-neutral-600">
                      {rule.reward_description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Members view */}
      {view === "members" && (
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Members</h2>
          {customers.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or phone"
                className="pl-9"
              />
            </div>
          )}
        </div>
        {customers.length === 0 ? (
          <EmptyState
            icon={<Star className="h-6 w-6" />}
            title="No customers yet"
            description="Once guests leave feedback they'll appear here and you can start awarding loyalty points."
          />
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No matches"
            description={`No members match "${search}". Try a different name or phone number.`}
          />
        ) : (
          <Card className="border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead className="hidden sm:table-cell text-right">
                      Earned
                    </TableHead>
                    <TableHead className="hidden sm:table-cell text-right">
                      Redeemed
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>
                        <div className="font-medium text-neutral-900">
                          {c.name}
                        </div>
                        <div className="text-xs text-neutral-500">{c.phone}</div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="secondary"
                          className="border-0 bg-neutral-100 text-neutral-800"
                        >
                          <Coins className="h-3 w-3" />
                          {c.totalPoints}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-neutral-600">
                        {c.pointsEarned}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-right text-neutral-600">
                        {c.pointsRedeemed}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openPoints(c, "earned")}
                          >
                            Add
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={c.totalPoints <= 0}
                            onClick={() => openPoints(c, "redeemed")}
                          >
                            Redeem
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
      </div>
      )}

      {/* Points history — Points view */}
      {view === "points" && (
      <div>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">
            Points history
          </h2>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Select
              value={historyType}
              onValueChange={(v) => v && setHistoryType(v as HistoryFilter)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All activity</SelectItem>
                <SelectItem value="earned">Earned</SelectItem>
                <SelectItem value="redeemed">Redeemed</SelectItem>
                <SelectItem value="adjusted">Adjusted</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative w-full sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search by name or phone"
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {transactions.length === 0 ? (
          <EmptyState
            icon={<History className="h-6 w-6" />}
            title="No activity yet"
            description="Points added or redeemed will show up here as a running log."
          />
        ) : filteredTransactions.length === 0 ? (
          <EmptyState
            icon={<Search className="h-6 w-6" />}
            title="No matching activity"
            description="Try a different filter, name, or phone number."
          />
        ) : (
          <Card className="border-0 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)] rounded-2xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden sm:table-cell">Notes</TableHead>
                    <TableHead className="text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((t) => {
                    const isRedeemed = t.transaction_type === "redeemed";
                    const isEarned = t.transaction_type === "earned";
                    return (
                      <TableRow key={t.id}>
                        <TableCell className="whitespace-nowrap text-sm text-neutral-600">
                          {TXN_DATE_FMT.format(new Date(t.created_at))}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-neutral-900">
                            {t.customerName}
                          </div>
                          {t.customerPhone && (
                            <div className="text-xs text-neutral-500">
                              {t.customerPhone}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={
                              isRedeemed
                                ? "border-0 bg-rose-50 text-rose-700"
                                : isEarned
                                ? "border-0 bg-emerald-50 text-emerald-700"
                                : "border-0 bg-neutral-100 text-neutral-700"
                            }
                          >
                            {isRedeemed ? (
                              <ArrowDownRight className="h-3 w-3" />
                            ) : isEarned ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <Settings2 className="h-3 w-3" />
                            )}
                            <span className="capitalize">
                              {t.transaction_type}
                            </span>
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-neutral-600">
                          {t.notes ?? "—"}
                        </TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            isRedeemed ? "text-rose-600" : "text-emerald-600"
                          }`}
                        >
                          {isRedeemed ? "−" : "+"}
                          {t.points}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
      )}

      {/* Create reward dialog */}
      <Dialog open={rewardOpen} onOpenChange={setRewardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create reward</DialogTitle>
            <DialogDescription>
              Define a reward members can redeem with their points.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="reward-name">Reward name</Label>
              <Input
                id="reward-name"
                value={rewardName}
                onChange={(e) => setRewardName(e.target.value)}
                placeholder="Free Dessert"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reward-points">Points required</Label>
              <Input
                id="reward-points"
                type="number"
                min={0}
                value={rewardPoints}
                onChange={(e) => setRewardPoints(e.target.value)}
                placeholder="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reward-desc">Description (optional)</Label>
              <Textarea
                id="reward-desc"
                value={rewardDesc}
                onChange={(e) => setRewardDesc(e.target.value)}
                placeholder="Any dessert from our menu, on the house."
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRewardOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitReward} disabled={isPending}>
              {isPending ? "Creating..." : "Create reward"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points dialog */}
      <Dialog
        open={pointsCustomer !== null}
        onOpenChange={(open) => !open && setPointsCustomer(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pointsType === "earned" ? "Add points" : "Redeem points"}
            </DialogTitle>
            <DialogDescription>
              {pointsCustomer?.name} · current balance{" "}
              {pointsCustomer?.totalPoints ?? 0} points
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={pointsType}
                onValueChange={(v) =>
                  v && setPointsType(v as LoyaltyTransactionType)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="redeemed">Redeemed</SelectItem>
                  <SelectItem value="adjusted">Adjusted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="points-amount">Points</Label>
              <Input
                id="points-amount"
                type="number"
                min={1}
                value={pointsAmount}
                onChange={(e) => setPointsAmount(e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="points-notes">Notes (optional)</Label>
              <Input
                id="points-notes"
                value={pointsNotes}
                onChange={(e) => setPointsNotes(e.target.value)}
                placeholder="Visit on 12 Jun"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPointsCustomer(null)}>
              Cancel
            </Button>
            <Button onClick={submitPoints} disabled={isPending}>
              {isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
