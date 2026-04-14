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
  title: "HotelDocKorea - AI Promotion Guide",
  description: "전국의 3-5성급 호텔 및 리조트 프로모션 정보를 실시간 수집·분석하여 전 세계 사용자에게 최적의 리뷰를 제공합니다. 에어비앤비형 커스텀 최저가 로봇",
  keywords: ["호텔", "프로모션", "호캉스", "할인", "호텔독코리아", "HotelDocKorea", "파이네트워크", "Pi"],
  openGraph: {
    title: "HotelDocKorea - 실시간 핫딜 특가",
    description: "AI가 찾은 이번 주 최고의 호텔을 확인하세요.",
    url: "https://hoteldockorea.com",
    siteName: "HotelDocKorea",
    images: [{ url: "/icon.svg" }],
    locale: "ko_KR",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    apple: "/icon.svg"
  }
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
      <head>
        <Script id="analytics-init" strategy="lazyOnload">
           {`/* window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX'); */`}
        </Script>
      </head>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <Script 
          src="https://sdk.minepi.com/pi-sdk.js" 
          strategy="beforeInteractive" 
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
