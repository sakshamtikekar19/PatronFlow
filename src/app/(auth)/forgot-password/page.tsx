import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { BRAND } from "@/config/branding";

export const metadata: Metadata = { title: "Reset Password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900">
        Reset your password
      </h2>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        Enter your email and we&apos;ll send you a link to reset your password.
      </p>

      <ForgotPasswordForm />
    </div>
  );
}
