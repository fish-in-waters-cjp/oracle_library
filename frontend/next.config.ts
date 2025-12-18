import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "oracle-library.zeabur.app",
      },
    ],
    // 在生產環境使用 unoptimized 避免圖片優化問題
    unoptimized: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
