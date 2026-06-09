import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { login } from "@/lib/actions/auth";
import { BRAND } from "@/config/branding";

export const metadata: Metadata = { title: "Sign in" };

interface LoginPageProps {
  searchParams: Promise<{ error?: string; confirmed?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error, confirmed } = await searchParams;

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900">
        Welcome to {BRAND.name}
      </h2>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        The restaurant growth platform that turns guests into loyal patrons.
      </p>

      {confirmed && (
        <p className="mb-5 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          Email confirmed. Sign in to finish setting up your restaurant.
        </p>
      )}

      {error === "auth_callback_failed" && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          That confirmation link was invalid or has expired. Try signing in, or
          sign up again to get a new link.
        </p>
      )}

      <AuthForm mode="login" action={login} />
    </div>
  );
}
