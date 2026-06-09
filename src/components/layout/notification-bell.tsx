"use client";

import { useEffect, useState } from "react";
import { Bell, AlertTriangle, UserPlus, Crown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationType } from "@/types";

const SEEN_KEY = "patronflow_notifications_seen_at";

const ICONS: Record<NotificationType, React.ReactNode> = {
  negative_feedback: <AlertTriangle className="h-4 w-4 text-red-600" />,
  new_customer: <UserPlus className="h-4 w-4 text-blue-600" />,
  vip: <Crown className="h-4 w-4 text-amber-600" />,
};

const ICON_BG: Record<NotificationType, string> = {
  negative_feedback: "bg-red-50",
  new_customer: "bg-blue-50",
  vip: "bg-amber-50",
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [seenAt, setSeenAt] = useState<number>(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = Number(localStorage.getItem(SEEN_KEY) ?? 0);
      if (!cancelled) setSeenAt(stored);
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = (await res.json()) as NotificationItem[];
        if (!cancelled) setNotifications(Array.isArray(data) ? data : []);
      } catch {
        // ignore
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const unreadCount = notifications.filter(
    (n) => new Date(n.createdAt).getTime() > seenAt
  ).length;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      const now = Date.now();
      localStorage.setItem(SEEN_KEY, String(now));
      // Delay marking as read so the badge clears after the panel opens.
      setTimeout(() => setSeenAt(now), 1200);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none hover:bg-neutral-100"
      >
        <Bell className="h-5 w-5 text-neutral-600" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-3">
          <span className="text-sm font-semibold text-neutral-900">
            Notifications
          </span>
          {notifications.length > 0 && (
            <span className="text-xs text-neutral-400">
              {notifications.length}
            </span>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <Bell className="mx-auto h-6 w-6 text-neutral-300" />
              <p className="mt-2 text-sm text-neutral-500">
                You&apos;re all caught up
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const isUnread = new Date(n.createdAt).getTime() > seenAt;
              return (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 border-b border-neutral-50 px-4 py-3 last:border-0",
                    isUnread && "bg-neutral-50/60"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      ICON_BG[n.type]
                    )}
                  >
                    {ICONS[n.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-neutral-900">
                      {n.title}
                    </p>
                    <p className="truncate text-sm text-neutral-500">
                      {n.description}
                    </p>
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {formatDistanceToNow(new Date(n.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
