"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/lib/actions/auth";
import { BRAND } from "@/config/branding";

interface BillingOnlyLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function BillingOnlyLayout({
  children,
  userEmail,
}: BillingOnlyLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-sm lg:px-8">
        <Image
          src="/patronflowlogo.png"
          alt={BRAND.name}
          width={1297}
          height={375}
          priority
          className="h-auto w-36"
        />
        <DropdownMenu>
          <DropdownMenuTrigger
            className="rounded-full px-3 py-1.5 text-sm text-muted-foreground outline-none hover:bg-muted"
            aria-label="Account menu"
          >
            {userEmail ?? "Account"}
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
      </header>
      <main className="mx-auto w-full max-w-6xl p-4 lg:p-8">{children}</main>
      <footer className="flex flex-col items-center gap-2 border-t border-border px-4 py-6 text-center">
        <nav className="flex items-center gap-3 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <span aria-hidden>·</span>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
        </nav>
      </footer>
    </div>
  );
}
