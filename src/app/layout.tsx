import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "HotelDocKorea — 한국 호텔 프로모션 가이드",
    template: "%s · HotelDocKorea",
  },
  description:
    "한국 3성급 이상 호텔·리조트 520여 곳의 실시간 프로모션, 주변 축제와 맛집, 기상정보까지 — 여행의 모든 정보를 한 곳에서",
  keywords: [
    "한국 호텔", "호텔 프로모션", "리조트", "축제", "여행", "숙박",
    "Korea hotels", "Korean hotel deals",
  ],
  authors: [{ name: "HotelDocKorea" }],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    alternateLocale: ["en_US", "ja_JP", "zh_CN", "es_ES"],
    url: "https://hoteldockorea.com",
    siteName: "HotelDocKorea",
    title: "HotelDocKorea — 한국 호텔 프로모션 가이드",
    description: "떠나기 전, 가장 먼저 열어보는 호텔 가이드",
    images: [
      {
        url: "/logo.svg",
        width: 200,
        height: 200,
        alt: "HotelDocKorea 로고",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "HotelDocKorea",
    description: "Your trusted doc for Korea's best hotel deals",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      {/* Cloudflare or GA4 Web Analytics Placeholder */}
      <head />
      <body className="min-h-full flex flex-col">
        <Script id="analytics-init" strategy="lazyOnload">
           {`/* window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX'); */`}
        </Script>
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="afterInteractive" 
        />
        <Script id="pi-init" strategy="afterInteractive">
          {`
            if (typeof window !== 'undefined' && window.Pi) {
              window.Pi.init({ version: "2.0", sandbox: true });
            }
          `}
        </Script>
        
        {/* Service Worker Registration */}
        <Script id="sw-init" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(registration) {
                  console.log('ServiceWorker registration successful with scope: ', registration.scope);
                }, function(err) {
                  console.log('ServiceWorker registration failed: ', err);
                });
              });
            }
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}
