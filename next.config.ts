import type { NextConfig } from "next";

// Content Security Policy - adjust as needed for external resources
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://checkout.razorpay.com https://www.paypal.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https://*.supabase.co https://*.stripe.com https://*.razorpay.com https://cdn.razorpay.com;
  font-src 'self';
  connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://api.razorpay.com https://lumberjack.razorpay.com https://checkout.razorpay.com https://api.paypal.com;
  frame-src https://js.stripe.com https://checkout.razorpay.com https://api.razorpay.com https://www.paypal.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\n/g, "");

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
];

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Cover/logo uploads run through Server Actions; the default 1MB limit
      // rejects larger images with "An unexpected response was received from
      // the server." Allow up to ~6MB to cover the 5MB upload cap + overhead.
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
