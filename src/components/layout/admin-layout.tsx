"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AdminSidebar } from "./admin-sidebar";
import { AdminNavbar } from "./admin-navbar";
import { BRAND } from "@/config/branding";
import { ContactLinkInline } from "@/components/contact/contact-link-inline";

interface AdminLayoutProps {
  children: React.ReactNode;
  userEmail?: string;
}

export function AdminLayoutShell({ children, userEmail }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col lg:ml-0">
        <AdminNavbar
          userEmail={userEmail}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 lg:p-8">
          {children}
        </main>
        <footer className="flex flex-col items-center gap-3 border-t border-border px-4 py-6 text-center lg:px-8">
          <Image
            src="/patronflowlogo.png"
            alt={BRAND.name}
            width={1297}
            height={375}
            className="h-6 w-auto"
          />
          <p className="text-xs text-muted-foreground">
            {BRAND.name} Super Admin
          </p>
          <ContactLinkInline
            stacked={false}
            linkClassName="text-muted-foreground hover:text-foreground"
          />
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
    </div>
  );
}
