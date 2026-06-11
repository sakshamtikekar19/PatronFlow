"use client";

import Image from "next/image";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { logout } from "@/lib/actions/auth";

interface NavbarProps {
  restaurantName?: string;
  restaurantLogo?: string | null;
  userEmail?: string;
  onMenuClick?: () => void;
}

export function Navbar({
  restaurantName,
  restaurantLogo,
  userEmail,
  onMenuClick,
}: NavbarProps) {
  const initials = restaurantName
    ? restaurantName.slice(0, 2).toUpperCase()
    : "DF";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-medium text-muted-foreground lg:hidden">
          {restaurantName}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 rounded-full px-2 py-1.5 outline-none hover:bg-muted"
            aria-label="Account menu"
          >
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {userEmail ?? restaurantName}
            </span>
            {restaurantLogo ? (
              <Image
                src={restaurantLogo}
                alt={restaurantName ?? "Restaurant logo"}
                width={32}
                height={32}
                unoptimized
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-400 text-xs font-medium text-white">
                {initials}
              </span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => logout()}
              className="cursor-pointer text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" aria-hidden />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
