import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    ];
  },
};

export default nextConfig;
