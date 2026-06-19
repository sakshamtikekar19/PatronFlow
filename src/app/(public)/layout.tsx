import Link from "next/link";
import Image from "next/image";
import { BRAND } from "@/config/branding";
import { ContactLinkInline } from "@/components/contact/contact-link-inline";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-light min-h-screen bg-[#F5F2ED]">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/patronflowlogo.png"
              alt={BRAND.name}
              width={1297}
              height={375}
              className="h-8 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/privacy"
              className="text-neutral-600 hover:text-neutral-900"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-neutral-600 hover:text-neutral-900"
            >
              Terms
            </Link>
            <Link
              href="/login"
              className="rounded-lg bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-12">{children}</main>
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-6 text-center sm:gap-6">
          <ContactLinkInline
            stacked={false}
            linkClassName="text-neutral-600 hover:text-neutral-900"
          />
          <div className="flex w-full flex-col items-center gap-2 text-sm text-neutral-500 sm:flex-row sm:justify-between">
            <p>© {new Date().getFullYear()} {BRAND.name}. All rights reserved.</p>
            <nav className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-neutral-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-neutral-900">
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}
