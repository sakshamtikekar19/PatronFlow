import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/config/branding";
import { ContactLinkInline } from "@/components/contact/contact-link-inline";

const FOOTER_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Contact", href: "/#contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
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
                Legal
              </h4>
              <ul className="mt-4 space-y-3">
                {LEGAL_LINKS.map((link) => (
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
                Contact
              </h4>
              <ContactLinkInline
                className="mt-4"
                linkClassName="text-neutral-700 hover:text-neutral-900"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-neutral-200/70 pt-6 sm:flex-row">
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.category}.
          </p>
          <nav className="flex items-center gap-4 text-xs text-neutral-400">
            <Link href="/privacy" className="hover:text-neutral-700">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-700">
              Terms of Service
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
