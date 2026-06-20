import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { Providers } from './providers';
import './globals.css';

const vazirmatn = localFont({
  src: [
    {
      path: '../public/fonts/vazirmatn/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/vazirmatn/Vazirmatn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/vazirmatn/Vazirmatn-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/vazirmatn/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'لحظه‌نما | دلار، طلا، نقره + طلافروشی‌ها',
  description: 'قیمت‌های لحظه‌ای دلار، طلا، نقره | همراه با طلافروشی‌های معتبر',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'لحظه‌نما',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5B041' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0f1e' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.variable}>
      <head>
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="font-vazir bg-gradient-to-br from-[#f0f4fa] to-[#e6ecf3] dark:from-[#0a0f1e] dark:to-[#0c1222] text-[#1e2a3e] dark:text-[#eef2ff] min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
