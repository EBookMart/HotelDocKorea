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
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

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
    verification: {
      // Google Search Console은 DNS 기반으로 자동 인증 완료. 메타 태그 불필요.
      // Naver Webmaster Tools 인증
      other: {
        "naver-site-verification": "1120c0492d19d34b98e9fa8823580665c4646812",
      },
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
