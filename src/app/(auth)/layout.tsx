import { BRAND } from "@/config/branding";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F2ED] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold italic text-neutral-900">
            {BRAND.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{BRAND.category}</p>
        </div>
        <div className="rounded-2xl bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          {children}
        </div>
        <footer className="mt-8 text-center">
          <p className="text-sm font-semibold italic text-neutral-700">
            {BRAND.name}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">{BRAND.tagline}</p>
        </footer>
      </div>
    </div>
  );
}
