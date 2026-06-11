import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Cover/logo uploads run through Server Actions; the default 1MB limit
      // rejects larger images with "An unexpected response was received from
      // the server." Allow up to ~6MB to cover the 5MB upload cap + overhead.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
