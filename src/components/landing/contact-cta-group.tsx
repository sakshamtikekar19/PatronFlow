"use client";

import { cn } from "@/lib/utils";
import { WhatsAppCta } from "./whatsapp-cta";
import { EmailCta } from "./email-cta";

interface ContactCtaGroupProps {
  size?: "default" | "lg";
  theme?: "light" | "dark";
  className?: string;
  whatsappLabel?: string;
  emailLabel?: string;
}

export function ContactCtaGroup({
  size = "default",
  theme = "light",
  className,
  whatsappLabel,
  emailLabel,
}: ContactCtaGroupProps) {
  const inverse = theme === "dark";

  return (
    <div
      className={cn(
        "flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center",
        className
      )}
    >
      <WhatsAppCta
        size={size}
        variant={inverse ? "inverse" : "primary"}
        label={whatsappLabel}
        className="sm:min-w-[220px]"
      />
      <EmailCta
        size={size}
        variant={inverse ? "inverse" : "outline"}
        label={emailLabel ?? "Email us"}
        className="sm:min-w-[220px]"
      />
    </div>
  );
}
