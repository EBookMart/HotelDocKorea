import type { MetadataRoute } from "next";

const SITE_URL = "https://hoteldockorea.com";
const LOCALES = ["ko", "en", "ja", "zh", "es"] as const;
const STATIC_PATHS = ["", "/admin", "/privacy", "/terms"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  for (const path of STATIC_PATHS) {
    for (const locale of LOCALES) {
      const url = `${SITE_URL}/${locale}${path}`;

      // hreflang 다국어 매핑 (Google이 같은 콘텐츠의 다른 언어 버전임을 인식)
      const alternates: Record<string, string> = {};
      for (const altLocale of LOCALES) {
        alternates[altLocale] = `${SITE_URL}/${altLocale}${path}`;
      }
      // x-default: 언어 미지정 사용자에게 보여줄 기본 (en 사용)
      alternates["x-default"] = `${SITE_URL}/en${path}`;

      entries.push({
        url,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "monthly",
        priority: path === "" ? 1.0 : 0.5,
        alternates: {
          languages: alternates,
        },
      });
    }
  }

  return entries;
}
