import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { signup } from "@/lib/actions/auth";
import { BRAND } from "@/config/branding";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900">
        Create your {BRAND.name} account
      </h2>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        Start turning guests into loyal patrons today.
      </p>
      <AuthForm mode="signup" action={signup} />
    </div>
  );
}
