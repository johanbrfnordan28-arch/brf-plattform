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
      {
        source: "/årshjul",
        destination: "/forening/arshjul",
        permanent: false,
      },
      {
        source: "/mina-foreningar",
        destination: "/testande-foreningar",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
