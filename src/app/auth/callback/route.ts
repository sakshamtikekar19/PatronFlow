import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  // New owners land on onboarding; the dashboard layout will also enforce this,
  // but pointing there directly avoids an extra redirect hop.
  const next = searchParams.get("next") ?? "/dashboard";

  const supabase = await createClient();

  // Email confirmation / magic links opened on any device use a token hash.
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });
    if (!error) {
      // Password recovery flow: redirect to reset-password page
      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Recovery link failed - redirect to reset-password with error
    if (type === "recovery") {
      return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`);
    }
  }

  // PKCE / OAuth flow (link opened in the same browser that initiated signup).
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check if this is a password recovery flow
      if (next === "/reset-password") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    // Recovery link failed
    if (next === "/reset-password") {
      return NextResponse.redirect(`${origin}/reset-password?error=invalid_token`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
