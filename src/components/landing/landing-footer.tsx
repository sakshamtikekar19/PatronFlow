import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/branding";
import {
  WHATSAPP_URL,
  WHATSAPP_PHONE_DISPLAY,
} from "@/config/landing";
import { WhatsAppIcon } from "./whatsapp-icon";

const FOOTER_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Contact", href: "#contact" },
];

export function LandingFooter() {
  return (
    <footer className="border-t border-neutral-200/70 bg-white/60">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row">
          <div className="max-w-xs">
            <Image
              src="/patronflowlogo.png"
              alt={BRAND.name}
              width={1297}
              height={375}
              className="h-auto w-36"
            />
            <p className="mt-4 text-sm text-neutral-500">{BRAND.tagline}</p>
          </div>

          <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Product
              </h4>
              <ul className="mt-4 space-y-3">
                {FOOTER_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                WhatsApp
              </h4>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-700 transition-colors hover:text-neutral-900"
              >
                <WhatsAppIcon className="h-4 w-4 text-[#25D366]" />
                {WHATSAPP_PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-200/70 pt-6 sm:flex-row">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.category}.
          </p>
          <p className="text-xs text-neutral-400">{BRAND.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
