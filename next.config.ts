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
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://dapi.kakao.com https://*.kakao.com",
              "style-src 'self' 'unsafe-inline' https://dapi.kakao.com https://*.kakao.com",
              "img-src 'self' data: blob: https://*.kakao.com https://*.kakaocdn.net https://*.daumcdn.net",
              "connect-src 'self' https://*.kakao.com https://*.kakaocdn.net https://*.daumcdn.net https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com",
              "frame-src 'self' https://*.kakao.com https://map.kakao.com",
              "font-src 'self' data: https://dapi.kakao.com",
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;