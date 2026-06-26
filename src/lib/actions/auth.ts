"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getPostLoginPath } from "@/lib/security/admin-access";
import { writeAuditLog } from "@/lib/admin/audit";
import { checkRateLimit, getClientIp, rateLimiters } from "@/lib/rate-limit";

export interface AuthResult {
  error?: string;
  success?: boolean;
  message?: string;
}

async function enforceAuthRateLimit(
  email: string,
  config: (typeof rateLimiters)["auth"],
  namespace: string
): Promise<AuthResult | null> {
  const ip = await getClientIp();
  const key = `${ip}:${email.trim().toLowerCase()}`;
  const rateLimit = await checkRateLimit(key, config, namespace);

  if (!rateLimit.success) {
    return {
      error: "Too many attempts. Please wait a minute and try again.",
    };
  }

  return null;
}

export async function login(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  const rateLimited = await enforceAuthRateLimit(email, rateLimiters.auth, "auth-login");
  if (rateLimited) return rateLimited;

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  revalidatePath("/", "layout");
  redirect(user ? getPostLoginPath(user) : "/dashboard");
}

export async function signup(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const restaurantName = formData.get("restaurant_name") as string;

  if (!email || !password || !restaurantName) {
    return { error: "All fields are required" };
  }

  const rateLimited = await enforceAuthRateLimit(email, rateLimiters.signup, "auth-signup");
  if (rateLimited) return rateLimited;

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        restaurant_name: restaurantName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Supabase returns a user with an empty identities array when the email is
  // already registered (it does this to avoid leaking which emails exist).
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "An account with this email already exists. Try signing in instead." };
  }

  // When "Confirm email" is enabled in Supabase, signUp succeeds but no session
  // is created until the user clicks the confirmation link. Redirecting to the
  // dashboard here would just bounce back to /login, so show a clear message.
  if (!data.session) {
    return {
      success: true,
      message:
        "Account created. Check your email to confirm your address, then sign in.",
    };
  }

  if (data.user) {
    await writeAuditLog({
      actorId: data.user.id,
      actorEmail: data.user.email,
      action: "account.signup",
      entityType: "user",
      entityId: data.user.id,
      metadata: { restaurantName: restaurantName.trim() },
    });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function requestPasswordReset(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Email is required" };
  }

  const rateLimited = await enforceAuthRateLimit(
    email,
    rateLimiters.auth,
    "auth-password-reset"
  );
  if (rateLimited) return rateLimited;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message:
      "If an account exists with this email, you will receive a password reset link shortly.",
  };
}

export async function updatePassword(
  _prevState: AuthResult,
  formData: FormData
): Promise<AuthResult> {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { error: "Both password fields are required" };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  // Check that the user has a valid session (came from the reset email link)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Invalid or expired reset link. Please request a new one." };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
    message: "Password updated successfully. You can now sign in with your new password.",
  };
}
