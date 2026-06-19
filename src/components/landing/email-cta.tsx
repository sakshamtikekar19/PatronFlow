"use client";

import { Mail } from "lucide-react";
import { motion } from "framer-motion";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/config/branding";
import { cn } from "@/lib/utils";

interface EmailCtaProps {
  label?: string;
  size?: "default" | "lg";
  variant?: "primary" | "outline" | "inverse";
  className?: string;
}

export function EmailCta({
  label = "Email us",
  size = "default",
  variant = "outline",
  className,
}: EmailCtaProps) {
  return (
    <motion.a
      href={CONTACT_MAILTO}
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        size === "lg" ? "h-14 px-8 text-base" : "h-11 px-5 text-sm",
        variant === "primary" &&
          "bg-neutral-900 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-neutral-800",
        variant === "outline" &&
          "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
        variant === "inverse" &&
          "border border-white/20 bg-white text-neutral-900 hover:bg-neutral-100",
        className
      )}
    >
      <Mail
        className={cn(
          size === "lg" ? "h-5 w-5" : "h-4 w-4",
          variant === "primary" ? "text-white" : "text-neutral-700"
        )}
        aria-hidden
      />
      {label}
      <span className="sr-only">{CONTACT_EMAIL}</span>
    </motion.a>
  );
}
