import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getUserAppAccess } from "@/lib/billing/subscription-access";
import { isSuperAdmin } from "@/lib/security/admin-access";
import {
  isBillingApiRoute,
  isProtectedApiRoute,
} from "@/lib/security/api-access";
import {
  checkRateLimit,
  getClientIpFromRequest,
  rateLimitExceededResponse,
  rateLimiters,
} from "@/lib/rate-limit";

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

  // Webhooks and cron must bypass session checks (no cookies, no redirects).
  if (
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/cron/") ||
    pathname === "/api/health"
  ) {
    return NextResponse.next({ request });
  }

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
  const isAdminRoute = pathname.startsWith("/admin");
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

  if (!user && (isProtectedApiRoute(pathname) || isAdminRoute)) {
    if (isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "admin_forbidden");
      return NextResponse.redirect(url);
    }
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user && isAdminRoute && !isSuperAdmin(user)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  if (user && isAdminRoute && isSuperAdmin(user)) {
    supabaseResponse.headers.set("x-pathname", pathname);
    return supabaseResponse;
  }

  if (user && isSuperAdmin(user) && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  if (user && isProtectedApiRoute(pathname)) {
    const ip = getClientIpFromRequest(request);
    const rateLimit = await checkRateLimit(
      `user:${user.id}:${ip}`,
      rateLimiters.general,
      "dashboard-api"
    );
    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit);
    }
  }

  if (user) {
    const needsAccessCheck =
      isProtectedRoute ||
      isProtectedApiRoute(pathname) ||
      isAuthRoute ||
      isOnboardingRoute ||
      pathname === "/";

    if (needsAccessCheck) {
      const access = await getUserAppAccess(user.id);

      const subscriptionInactive = Boolean(
        access.restaurant && !access.isActive
      );

      if (
        !subscriptionInactive &&
        access.needsOnboarding &&
        isProtectedRoute &&
        !isOnboardingRoute &&
        !isBillingRoute
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      if (access.isSuspended) {
        const allowedWhileSuspended =
          isPublicRoute ||
          pathname.startsWith("/auth/") ||
          pathname === "/forgot-password" ||
          pathname === "/reset-password" ||
          pathname === "/login";

        if (!allowedWhileSuspended) {
          const url = request.nextUrl.clone();
          url.pathname = "/login";
          url.searchParams.set("error", "account_suspended");
          return NextResponse.redirect(url);
        }
      }

      if (subscriptionInactive) {
        if (isProtectedApiRoute(pathname)) {
          return NextResponse.json(
            {
              error: "Subscription required",
              code: "SUBSCRIPTION_INACTIVE",
            },
            { status: 403 }
          );
        }

        const allowedWhileInactive =
          isBillingRoute ||
          isBillingApiRoute(pathname) ||
          isPublicRoute ||
          pathname.startsWith("/auth/") ||
          pathname === "/forgot-password" ||
          pathname === "/reset-password";

        if (
          !allowedWhileInactive &&
          (isProtectedRoute || isOnboardingRoute || pathname === "/")
        ) {
          const url = request.nextUrl.clone();
          url.pathname = "/billing";
          return NextResponse.redirect(url);
        }
      }

      if (isAuthRoute) {
        const url = request.nextUrl.clone();
        if (isSuperAdmin(user)) {
          url.pathname = "/admin";
          return NextResponse.redirect(url);
        }
        url.pathname = subscriptionInactive
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
