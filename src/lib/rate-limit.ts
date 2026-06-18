import { headers } from "next/headers";

/**
 * Simple in-memory rate limiter for development and production without Upstash.
 * For production at scale, configure UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
 *
 * This implementation uses a sliding window approach with in-memory storage.
 * Note: In-memory storage resets on server restart and doesn't work across
 * multiple serverless instances. Use Upstash for production deployments.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory store (works for single-instance deployments)
const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (entry.resetAt < now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for an identifier (usually IP address or user ID)
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  const windowMs = config.windowSeconds * 1000;

  let entry = store.get(key);

  // Create new entry or reset if window expired
  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  entry.count++;
  store.set(key, entry);

  const remaining = Math.max(0, config.limit - entry.count);
  const success = entry.count <= config.limit;

  return {
    success,
    limit: config.limit,
    remaining,
    reset: Math.ceil(entry.resetAt / 1000),
  };
}

/**
 * Get client IP address from request headers
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Try various headers that may contain the real IP
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Vercel-specific
  const vercelForwardedFor = headersList.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  /** Auth endpoints: 5 requests per minute */
  auth: { limit: 5, windowSeconds: 60 },

  /** Signup: 3 requests per minute (stricter) */
  signup: { limit: 3, windowSeconds: 60 },

  /** Public API (feedback, RSVP): 20 requests per minute */
  publicApi: { limit: 20, windowSeconds: 60 },

  /** Phone lookup: 10 requests per minute */
  lookup: { limit: 10, windowSeconds: 60 },

  /** Data export: 5 requests per hour */
  export: { limit: 5, windowSeconds: 3600 },

  /** General API: 100 requests per minute */
  general: { limit: 100, windowSeconds: 60 },
};

/**
 * Rate limit response headers
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

/**
 * Create a rate-limited JSON response for when limit is exceeded
 */
export function rateLimitExceededResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${Math.ceil((result.reset * 1000 - Date.now()) / 1000)} seconds.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...rateLimitHeaders(result),
        "Retry-After": Math.ceil(
          (result.reset * 1000 - Date.now()) / 1000
        ).toString(),
      },
    }
  );
}
