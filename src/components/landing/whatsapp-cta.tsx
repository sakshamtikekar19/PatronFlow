"use client";

import { motion } from "framer-motion";
import { WhatsAppIcon } from "./whatsapp-icon";
import { WHATSAPP_URL, PRIMARY_CTA_LABEL } from "@/config/landing";
import { cn } from "@/lib/utils";

interface WhatsAppCtaProps {
  label?: string;
  size?: "default" | "lg";
  variant?: "primary" | "outline";
  className?: string;
}

export function WhatsAppCta({
  label = PRIMARY_CTA_LABEL,
  size = "default",
  variant = "primary",
  className,
}: WhatsAppCtaProps) {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ type: "spring", stiffness: 400, damping: 22 }}
      className={cn(
        "group inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        size === "lg" ? "h-14 px-8 text-base" : "h-11 px-5 text-sm",
        variant === "primary"
          ? "bg-neutral-900 text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:bg-neutral-800"
          : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
        className
      )}
    >
      <WhatsAppIcon
        className={cn(
          size === "lg" ? "h-5 w-5" : "h-4 w-4",
          variant === "primary" ? "text-[#25D366]" : "text-[#25D366]"
        )}
      />
      {label}
    </motion.a>
  );
}
