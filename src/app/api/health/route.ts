import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Health check endpoint for monitoring and load balancers.
 * Returns 200 if the service is healthy, 503 if there are issues.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error"> = {};

  // Check database connectivity
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("restaurants").select("id").limit(1);
    checks.database = error ? "error" : "ok";
  } catch {
    checks.database = "error";
  }

  // Check environment variables
  checks.env =
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
      ? "ok"
      : "error";

  const allHealthy = Object.values(checks).every((status) => status === "ok");

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
    },
    {
      status: allHealthy ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
