import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: *",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' *",
              "img-src 'self' data: blob: *",
              "connect-src 'self' *",
              "frame-src 'self' *",
              "style-src 'self' 'unsafe-inline' *",
              "font-src 'self' data: *",
              "worker-src 'self' blob: *",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;