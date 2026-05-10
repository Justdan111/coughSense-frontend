import type { NextConfig } from "next";
import { env } from "process";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    FASTAPI_URL: env.FASTAPI_URL,
  },
  reactCompiler: true,
};

export default nextConfig;
