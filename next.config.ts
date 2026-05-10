import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    SUPABASE_URL: env.SUPABASE_URL,
    SUPABASE_API_KEY: env.SUPABASE_API_KEY,
    SUPABASE_JWT_SECRET: env.SUPABASE_JWT_SECRET,
  },
  reactCompiler: true,
};

export default nextConfig;
