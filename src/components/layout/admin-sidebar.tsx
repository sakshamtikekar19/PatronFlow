"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Store,
  BarChart3,
  IndianRupee,
  LifeBuoy,
  ScrollText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/config/branding";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/restaurants", label: "Restaurants", icon: Store },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/revenue", label: "Revenue", icon: IndianRupee },
  { href: "/admin/support", label: "Support", icon: LifeBuoy },
  { href: "/admin/audit", label: "Audit Logs", icon: ScrollText },
];

interface AdminSidebarProps {
  open?: boolean;
  onClose?: () => void;
  className?: string;
}

export function AdminSidebar({ open, onClose, className }: AdminSidebarProps) {
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
        <div className="flex h-16 flex-col justify-center gap-0.5 px-6">
          <Link href="/admin" className="flex items-center" onClick={onClose}>
            <Image
              src="/patronflowlogo.png"
              alt={BRAND.name}
              width={1297}
              height={375}
              priority
              className="h-auto w-36"
            />
          </Link>
          <p className="text-xs font-medium text-muted-foreground">
            Super Admin
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4" aria-label="Admin">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);
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
