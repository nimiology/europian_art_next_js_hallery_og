import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The DB is read at runtime via fs, so tell Vercel's file tracer to ship it with the API functions.
  outputFileTracingIncludes: {
    "/api/**": ["./data/arts.sqlite3"],
  },
};

export default nextConfig;
