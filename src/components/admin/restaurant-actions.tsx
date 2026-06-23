"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteRestaurantAsAdmin,
  impersonateRestaurantOwner,
  suspendRestaurant,
  unsuspendRestaurant,
} from "@/lib/actions/admin";
import type { AdminRestaurantDetail } from "@/lib/queries/admin";

interface RestaurantAdminActionsProps {
  restaurant: AdminRestaurantDetail;
}

export function RestaurantAdminActions({
  restaurant,
}: RestaurantAdminActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");

  function runAction(action: () => Promise<{ error?: string; url?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.url) {
        window.location.href = result.url;
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          disabled={pending}
          onClick={() =>
            runAction(() => impersonateRestaurantOwner(restaurant.id))
          }
        >
          Login as owner
        </Button>

        {restaurant.isSuspended ? (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => runAction(() => unsuspendRestaurant(restaurant.id))}
          >
            Unsuspend
          </Button>
        ) : (
          <Button
            variant="secondary"
            disabled={pending}
            onClick={() => setSuspendOpen(true)}
          >
            Suspend
          </Button>
        )}

        <Button
          variant="destructive"
          disabled={pending}
          onClick={() => setDeleteOpen(true)}
        >
          Delete restaurant
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend {restaurant.name}?</DialogTitle>
            <DialogDescription>
              The owner will lose dashboard access until you unsuspend this
              restaurant.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="suspend-reason">Reason (optional)</Label>
            <Input
              id="suspend-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Policy violation, payment issue, etc."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                runAction(() => suspendRestaurant(restaurant.id, reason))
              }
            >
              Suspend
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {restaurant.name}?</DialogTitle>
            <DialogDescription>
              This permanently deletes the owner account, restaurant, and all
              related data. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={pending}
              onClick={() =>
                runAction(async () => {
                  const result = await deleteRestaurantAsAdmin(restaurant.id);
                  if (!result.error) {
                    router.push("/admin/restaurants");
                  }
                  return result;
                })
              }
            >
              Delete permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
