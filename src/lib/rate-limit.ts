import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

/**
 * Rate limiting with Upstash Redis in production (when env vars are set).
 * Falls back to in-memory storage for local development.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitEntry>();
const upstashLimiters = new Map<string, Ratelimit>();

if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryStore.entries()) {
      if (entry.resetAt < now) {
        memoryStore.delete(key);
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

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}

if (process.env.NODE_ENV === "production" && !isUpstashConfigured()) {
  console.error(
    "SECURITY: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are not set. " +
      "Rate limits use per-instance memory and are easy to bypass on serverless."
  );
}

function getUpstashLimiter(
  config: RateLimitConfig,
  namespace: string
): Ratelimit {
  const key = `${namespace}:${config.limit}:${config.windowSeconds}`;
  let limiter = upstashLimiters.get(key);

  if (!limiter) {
    limiter = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(
        config.limit,
        `${config.windowSeconds} s`
      ),
      prefix: `patronflow:${namespace}`,
    });
    upstashLimiters.set(key, limiter);
  }

  return limiter;
}

function checkMemoryRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowMs = config.windowSeconds * 1000;

  let entry = memoryStore.get(identifier);

  if (!entry || entry.resetAt < now) {
    entry = {
      count: 0,
      resetAt: now + windowMs,
    };
  }

  entry.count++;
  memoryStore.set(identifier, entry);

  const remaining = Math.max(0, config.limit - entry.count);

  return {
    success: entry.count <= config.limit,
    limit: config.limit,
    remaining,
    reset: Math.ceil(entry.resetAt / 1000),
  };
}

/**
 * Check rate limit for an identifier (usually IP address or user ID).
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
  namespace = "default"
): Promise<RateLimitResult> {
  if (isUpstashConfigured()) {
    const limiter = getUpstashLimiter(config, namespace);
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  }

  return checkMemoryRateLimit(`${namespace}:${identifier}`, config);
}

/**
 * Get client IP address from request headers (middleware-safe).
 */
export function getClientIpFromRequest(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const vercelForwardedFor = request.headers.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

/**
 * Get client IP address from Next.js request headers.
 */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  const vercelForwardedFor = headersList.get("x-vercel-forwarded-for");
  if (vercelForwardedFor) {
    return vercelForwardedFor.split(",")[0].trim();
  }

  return "unknown";
}

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

  /** Owner dashboard API: 100 requests per minute */
  general: { limit: 100, windowSeconds: 60 },
};

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.reset.toString(),
  };
}

export function rateLimitExceededResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: `Rate limit exceeded. Try again in ${Math.max(
        1,
        Math.ceil((result.reset * 1000 - Date.now()) / 1000)
      )} seconds.`,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...rateLimitHeaders(result),
        "Retry-After": Math.max(
          1,
          Math.ceil((result.reset * 1000 - Date.now()) / 1000)
        ).toString(),
      },
    }
  );
}
