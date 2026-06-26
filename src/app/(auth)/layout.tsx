import Image from "next/image";
import { BRAND } from "@/config/branding";
import { ContactLinkInline } from "@/components/contact/contact-link-inline";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="theme-light flex min-h-screen flex-col items-center justify-center bg-[#F5F2ED] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Image
            src="/patronflowlogo.png"
            alt={`${BRAND.name} — ${BRAND.tagline}`}
            width={1297}
            height={375}
            priority
            className="h-auto w-64"
          />
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {children}
        </div>
        <footer className="mt-8 space-y-3 text-center">
          <ContactLinkInline
            linkClassName="justify-center text-neutral-600 hover:text-neutral-900"
          />
          <p className="text-xs text-neutral-400" suppressHydrationWarning>
            © {new Date().getFullYear()} {BRAND.name}. {BRAND.category}.
          </p>
        </footer>
      </div>
    </div>
  );
}
