import { Mail } from "lucide-react";
import { CONTACT_EMAIL, CONTACT_MAILTO } from "@/config/branding";
import { WHATSAPP_PHONE_DISPLAY, WHATSAPP_URL } from "@/config/landing";
import { WhatsAppIcon } from "@/components/landing/whatsapp-icon";
import { cn } from "@/lib/utils";

interface ContactLinkInlineProps {
  className?: string;
  stacked?: boolean;
  linkClassName?: string;
}

export function ContactLinkInline({
  className,
  stacked = true,
  linkClassName,
}: ContactLinkInlineProps) {
  const linkStyles = cn(
    "inline-flex items-center gap-2 text-sm font-medium transition-colors",
    linkClassName
  );

  return (
    <div
      className={cn(
        stacked ? "flex flex-col gap-3" : "flex flex-wrap items-center gap-4",
        className
      )}
    >
      <a href={CONTACT_MAILTO} className={linkStyles}>
        <Mail className="h-4 w-4 shrink-0" aria-hidden />
        {CONTACT_EMAIL}
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={linkStyles}
      >
        <WhatsAppIcon className="h-4 w-4 shrink-0 text-[#25D366]" />
        {WHATSAPP_PHONE_DISPLAY}
      </a>
    </div>
  );
}
