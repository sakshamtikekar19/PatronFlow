import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserAppAccess } from "@/lib/billing/subscription-access";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/signup");
  const isPublicRoute =
    pathname.startsWith("/review/") ||
    pathname.startsWith("/r/") ||
    pathname.startsWith("/api/feedback") ||
    // Public event pages and RSVP submissions (the admin /events page has no
    // trailing slash so it stays protected by the catch-all below).
    pathname.startsWith("/events/") ||
    pathname.startsWith("/api/events/") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/terms");
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/customers") ||
    pathname.startsWith("/feedback") ||
    pathname.startsWith("/recovery") ||
    pathname.startsWith("/loyalty") ||
    pathname === "/events" ||
    pathname.startsWith("/qr") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/billing");

  const isBillingRoute = pathname.startsWith("/billing");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const isApiBillingRoute = pathname.startsWith("/api/billing");

  if (user) {
    const needsAccessCheck =
      isProtectedRoute || isAuthRoute || isOnboardingRoute || pathname === "/";

    if (needsAccessCheck) {
      const access = await getUserAppAccess(user.id);

      if (
        access.needsOnboarding &&
        isProtectedRoute &&
        !isOnboardingRoute &&
        !isBillingRoute
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      if (access.isLocked) {
        const allowedWhileLocked =
          isBillingRoute ||
          isApiBillingRoute ||
          isPublicRoute ||
          pathname.startsWith("/auth/") ||
          pathname === "/forgot-password" ||
          pathname === "/reset-password";

        if (!allowedWhileLocked) {
          const url = request.nextUrl.clone();
          url.pathname = "/billing";
          return NextResponse.redirect(url);
        }
      }

      if (isAuthRoute) {
        const url = request.nextUrl.clone();
        url.pathname = access.isLocked
          ? "/billing"
          : access.needsOnboarding
            ? "/onboarding"
            : "/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  if (!user && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // "/" is the public marketing landing page — accessible to everyone.

  if (!user && !isAuthRoute && !isPublicRoute && pathname !== "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  supabaseResponse.headers.set("x-pathname", pathname);

  return supabaseResponse;
}
