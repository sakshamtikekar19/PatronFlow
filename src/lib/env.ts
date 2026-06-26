import { z } from "zod";

/**
 * Environment variable validation schema. Zod validates at runtime; missing or
 * malformed values throw immediately so issues surface at build/startup rather
 * than in production traffic.
 */

const serverSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Stripe (optional until billing is enabled)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_PRICE_ID: z.string().optional(),

  // Razorpay (optional until billing is enabled)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_PLAN_ID: z.string().optional(),
  RAZORPAY_PLAN_INR: z.string().optional(),
  RAZORPAY_PLAN_USD: z.string().optional(),

  // PayPal (optional until billing is enabled)
  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_WEBHOOK_ID: z.string().optional(),
  PAYPAL_PLAN_ID: z.string().optional(),

  // Upstash Redis for rate limiting (optional)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Cron job authentication
  CRON_SECRET: z.string().optional(),
}).superRefine((data, ctx) => {
  if (process.env.NODE_ENV === "production" && !data.CRON_SECRET?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "CRON_SECRET is required in production",
      path: ["CRON_SECRET"],
    });
  }
});

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;

function validateEnv() {
  const parsed = serverSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  return parsed.data;
}

function validateClientEnv() {
  const clientEnv = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  };

  const parsed = clientSchema.safeParse(clientEnv);

  if (!parsed.success) {
    console.error(
      "❌ Invalid client environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

// Validate on module load (fail fast)
export const env = validateEnv();
export const clientEnv = validateClientEnv();
