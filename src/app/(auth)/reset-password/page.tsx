import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Set New Password" };

interface ResetPasswordPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const { error } = await searchParams;

  return (
    <div>
      <h2 className="text-xl font-semibold text-neutral-900">
        Set a new password
      </h2>
      <p className="mb-6 mt-1 text-sm text-neutral-500">
        Enter your new password below.
      </p>

      {error === "invalid_token" && (
        <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
      )}

      <ResetPasswordForm />
    </div>
  );
}
