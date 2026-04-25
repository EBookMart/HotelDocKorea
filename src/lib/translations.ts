// src/lib/translations.ts
// 빌드 타임에 생성된 번역 데이터에서 locale에 맞는 값을 조회.
// 번역이 없으면 한국어 원본으로 폴백.

import translationsData from "../../public/data/translations.json";

type LocaleCode = "ko" | "en" | "ja" | "zh" | "es";

interface TranslationsShape {
  hotels: {
    names: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
    addresses: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
  };
  promotions: {
    titles: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
    discounts: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
  };
  festivals: {
    names: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
    locations: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
    descriptions: Record<Exclude<LocaleCode, "ko">, Record<string, string>>;
  };
}

const translations = translationsData as unknown as TranslationsShape;

/**
 * 한국어 원본 텍스트를 locale에 맞게 번역하여 반환.
 * 번역이 없거나 locale이 ko이면 원본 그대로 반환.
 */
function lookup(
  category: "hotels" | "promotions" | "festivals",
  field: string,
  koreanText: string,
  locale: string
): string {
  if (!koreanText) return koreanText;
  if (locale === "ko") return koreanText;

  const targetLocale = locale as Exclude<LocaleCode, "ko">;
  const categoryData = (translations as any)[category];
  if (!categoryData) return koreanText;

  const fieldData = categoryData[field]?.[targetLocale];
  if (!fieldData) return koreanText;

  const translated = fieldData[koreanText];
  return translated || koreanText;
}

export const translateHotelName = (koreanName: string, locale: string) =>
  lookup("hotels", "names", koreanName, locale);

export const translateHotelAddress = (koreanAddr: string, locale: string) =>
  lookup("hotels", "addresses", koreanAddr, locale);

export const translatePromoTitle = (koreanTitle: string, locale: string) =>
  lookup("promotions", "titles", koreanTitle, locale);

export const translatePromoDiscount = (koreanDiscount: string, locale: string) =>
  lookup("promotions", "discounts", koreanDiscount, locale);

export const translateFestivalName = (koreanName: string, locale: string) =>
  lookup("festivals", "names", koreanName, locale);

export const translateFestivalLocation = (koreanLoc: string, locale: string) =>
  lookup("festivals", "locations", koreanLoc, locale);

export const translateFestivalDescription = (koreanDesc: string, locale: string) =>
  lookup("festivals", "descriptions", koreanDesc, locale);
