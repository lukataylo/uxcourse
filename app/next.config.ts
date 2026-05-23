import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The repo root contains a separate Vite app with its own lockfile.
  // Pin Next's tracing root to this app so it doesn't pick up the wrong one.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
