import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
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
