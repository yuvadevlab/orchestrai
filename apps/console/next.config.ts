import type { NextConfig } from "next";

/**
 * Next.js 15 configuration for OrchestrAI Console.
 * Transpiles local design-system packages linked from the sibling repository.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@yuva-devlab/ui", "@yuva-devlab/tokens"],
  async redirects() {
    return [
      {
        source: "/console",
        destination: "/",
        permanent: true,
      },
      {
        source: "/console/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/knowledge",
        destination: "/context?tab=knowledge",
        permanent: true,
      },
      {
        source: "/memory",
        destination: "/context?tab=memory",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
