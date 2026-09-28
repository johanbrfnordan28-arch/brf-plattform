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
        source: "/forening/energi",
        destination: "/forening/felanmalan",
        permanent: true,
      },
      {
        source: "/energi",
        destination: "/felanmalan",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
