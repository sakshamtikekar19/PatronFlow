import type { User } from "@supabase/supabase-js";

export type PlatformRole = "super_admin" | "restaurant_owner";

export function getUserRole(user: User | null): PlatformRole | undefined {
  if (!user) return undefined;
  const role = (user.app_metadata as { role?: string } | undefined)?.role;
  if (role === "super_admin") return "super_admin";
  return "restaurant_owner";
}

export function isSuperAdmin(user: User | null): boolean {
  if (!user) return false;
  if (getUserRole(user) === "super_admin") return true;

  const allowlist =
    process.env.SUPER_ADMIN_EMAILS?.split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? [];

  return Boolean(
    user.email && allowlist.includes(user.email.toLowerCase())
  );
}

export function getPostLoginPath(user: User): string {
  return isSuperAdmin(user) ? "/admin" : "/dashboard";
}
