import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "../../i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// OpenGraph 로케일 매핑 (BCP-47 → OG 표준)
const OG_LOCALE_MAP: Record<string, string> = {
  ko: "ko_KR",
  en: "en_US",
  ja: "ja_JP",
  zh: "zh_CN",
  es: "es_ES",
};

export const viewport: Viewport = {
  themeColor: "#4338ca",
  width: "device-width",
  initialScale: 1,
  // maximumScale 제거: 모바일 확대 허용 (접근성)
};

// 빌드 타임에 5개 로케일 정적 페이지 사전 생성
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 로케일별 동적 메타데이터 생성
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  const title = `${t("brandName")} — ${t("subtitle")}`;
  const description = t("metaDescription");
  const ogLocale = OG_LOCALE_MAP[locale] ?? "en_US";
  const alternateLocales = Object.values(OG_LOCALE_MAP).filter(
    (l) => l !== ogLocale
  );

  return {
    metadataBase: new URL("https://hoteldockorea.com"),
    title: {
      default: title,
      template: `%s · ${t("brandName")}`,
    },
    description,
    authors: [{ name: "HotelDocKorea" }],
    icons: {
      icon: "/favicon.svg",
      apple: "/apple-touch-icon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      locale: ogLocale,
      alternateLocale: alternateLocales,
      url: `https://hoteldockorea.com/${locale}`,
      siteName: t("brandName"),
      title,
      description,
      images: [
        {
          url: "/logo.svg",
          width: 200,
          height: 200,
          alt: t("brandName"),
        },
      ],
    },
    twitter: {
      card: "summary",
      title: t("brandName"),
      description,
      images: ["/logo.svg"],
    },
    alternates: {
      canonical: `https://hoteldockorea.com/${locale}`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `https://hoteldockorea.com/${l}`])
      ),
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // 유효하지 않은 로케일이면 404
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 정적 렌더링 활성화 (SEO의 핵심)
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head />
      <body className="min-h-full flex flex-col">
        {/* GA4 Analytics Placeholder */}
        <Script id="analytics-init" strategy="lazyOnload">
          {`/* window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-XXXXXXXXXX'); */`}
        </Script>

        {/* Pi Network SDK */}
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

        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
