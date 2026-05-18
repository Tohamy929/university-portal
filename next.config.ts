import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // Whenever the frontend asks for something starting with /api-proxy/
        source: '/api-proxy/:path*',
        // Vercel's server will secretly fetch it from your HTTP backend!
        destination: 'http://smartattend456-001-site1.qtempurl.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
