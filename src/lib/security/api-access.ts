/**
 * Route classification for API subscription and auth guards.
 */

export function isPublicApiRoute(pathname: string): boolean {
  if (pathname === "/api/health") return true;
  if (pathname.startsWith("/api/webhooks/")) return true;
  if (pathname.startsWith("/api/cron/")) return true;
  if (pathname.startsWith("/api/feedback")) return true;
  // Public guest RSVP submit — not the owner /rsvps list.
  if (/^\/api\/events\/[^/]+\/rsvp$/.test(pathname)) return true;
  return false;
}

export function isBillingApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/billing");
}

export function isProtectedApiRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/api/") &&
    !isPublicApiRoute(pathname) &&
    !isBillingApiRoute(pathname)
  );
}
