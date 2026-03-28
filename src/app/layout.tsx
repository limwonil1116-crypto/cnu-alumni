import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '충청지역 백마회',
  description: '한국농어촌공사 충청지역 충남대 동문 네트워크',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="백마회" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#1B63C6" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
}