import type { NextConfig } from "next";

/**
 * Next.js 15 configuration for OrchestrAI Console.
 * Transpiles local design-system packages linked from the sibling repository.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@yuva-devlab/ui", "@yuva-devlab/tokens"],
};

export default nextConfig;
