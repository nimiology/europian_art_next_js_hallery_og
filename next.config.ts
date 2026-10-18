import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // The DB is read at runtime via fs, so tell Vercel's file tracer to ship it with every server function.
  outputFileTracingIncludes: {
    "/**": ["./data/arts.sqlite3"],
  },
};

export default nextConfig;
