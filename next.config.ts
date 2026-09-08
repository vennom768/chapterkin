import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb",
      allowedOrigins: [
        "chapterkin.com",
        "www.chapterkin.com",
        "chapterkin-production.up.railway.app",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
};

export default nextConfig;
