"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  QrCode,
  Settings,
  HeartHandshake,
  Gift,
  CalendarDays,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/branding";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/recovery", label: "Guest Recovery", icon: HeartHandshake },
  { href: "/loyalty", label: "Loyalty", icon: Gift },
  { href: "/events", label: "Events", icon: CalendarDays },
  { href: "/qr", label: "QR Codes", icon: QrCode },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export function Sidebar({ open, onClose, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center">
            <Image
              src="/patronflowlogo.png"
              alt={BRAND.name}
              width={1297}
              height={375}
              priority
              className="h-auto w-40"
            />
          </Link>
          {onClose && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="lg:hidden"
              aria-label="Close navigation menu"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Main">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
