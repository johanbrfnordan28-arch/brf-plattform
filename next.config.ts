import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/forening/årshjul",
        destination: "/forening/arshjul",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
