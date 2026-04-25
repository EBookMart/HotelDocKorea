"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

interface HotPickData {
  hotelName: string;
  promoTitle: string;
  discount: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

interface HotPickItem {
  hotelName: string;
  promoTitle: string;
  discount: string;
  region: string;
  grade: number;
  imageUrl?: string;
  isPromo: boolean;
}

interface Hotel {
  [key: string]: any;
}

// 권역 키(한글) → i18n 메시지 키 매핑
const REGION_TO_I18N: Record<string, string> = {
  "수도권": "capital",
  "영동권": "yeongdong",
  "부산경남권": "busan",
  "대구경북권": "daegu",
  "광주호남권": "honam",
  "충청권": "chungcheong",
  "제주도": "jeju",
};

import { buildAffiliateUrl } from "@/lib/affiliate";

export default function HotPicksSection({
  selectedRegion,
  selectedGrade,
  fallbackHotels,
  promotions,
}: {
  selectedRegion: string | null;
  selectedGrade: number | null;
  fallbackHotels: Hotel[];
  promotions: HotPickData[];
}) {
  const t = useTranslations("hotPicks");
  const tHeader = useTranslations("header");
  const tRegions = useTranslations("regions");
  const locale = useLocale();

  const today = new Date().toISOString().split("T")[0];

  // 1단계: 유효한 프로모션 필터링 및 hotels.json과 매칭
  const activePromos: HotPickItem[] = promotions
    .filter((p) => {
      if (!p.active) return false;
      if (p.startDate && p.startDate > today) return false;
      if (p.endDate && p.endDate < today) return false;
      return true;
    })
    .map((p) => {
      const matched = fallbackHotels.find(
        (h) => (h.이름 || h.name || h.hotelName) === p.hotelName
      );
      return {
        hotelName: p.hotelName,
        promoTitle: p.promoTitle,
        discount: p.discount,
        region: matched?.region || matched?.시도 || "",
        grade: matched?.grade || parseInt(matched?.rating || "3"),
        imageUrl: matched?.imageUrl,
        isPromo: true,
      };
    })
    .filter((p) => !!p.imageUrl);

  // 2단계: 필터 적용
  let displayedItems = activePromos.filter((p) => {
    if (selectedRegion && p.region !== selectedRegion) return false;
    if (selectedGrade && p.grade !== selectedGrade) return false;
    return true;
  });

  const hasPromos = displayedItems.length > 0;

  // 3단계: Fallback (5성급 자동 선별)
  if (displayedItems.length < 4) {
    const extraHotels = fallbackHotels
      .filter((h) => {
        const grade = h.grade || parseInt(h.rating || "0");
        const region = h.region || h.시도 || "";
        const hasImage = !!h.imageUrl;

        if (selectedRegion && region !== selectedRegion) return false;
        if (selectedGrade && grade !== selectedGrade) return false;
        if (grade !== 5 || !hasImage) return false;

        const hotelName = h.이름 || h.name || h.hotelName;
        if (displayedItems.some((item) => item.hotelName === hotelName)) return false;

        return true;
      })
      .slice(0, 4 - displayedItems.length)
      .map((h) => ({
        hotelName: h.이름 || h.name || h.hotelName || "",
        promoTitle: h.주소 || h.address || "",
        discount: t("recommended"),
        region: h.region || h.시도 || "",
        grade: h.grade || parseInt(h.rating || "3"),
        imageUrl: h.imageUrl,
        isPromo: false,
      }));

    displayedItems = [...displayedItems, ...extraHotels];
  }

  const finalDisplay = displayedItems.slice(0, 4);

  // 지역 라벨 구성
  const regionI18nKey = selectedRegion ? REGION_TO_I18N[selectedRegion] : null;
  const regionLabel = regionI18nKey ? tRegions(regionI18nKey) : tHeader("allRegions");

  const sectionTitle = hasPromos
    ? t("promoTitle", { region: regionLabel })
    : t("recommendedTitle", { region: regionLabel });

  const badgeLabel = hasPromos ? t("editorPick") : t("stayPick");
  const sectionIcon = hasPromos ? "🔥" : "✨";

  // 빈 상태
  if (finalDisplay.length === 0) {
    return (
      <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center py-16">
          <div className="text-5xl mb-4 opacity-50">🏝️</div>
          <h2 className="text-2xl font-bold text-purple-900/40 mb-2">{sectionTitle}</h2>
          <p className="text-purple-900/30">{t("preparing")}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-3xl">{sectionIcon}</span>
          <h2 className="text-2xl font-bold text-purple-900 mr-2">{sectionTitle}</h2>
          <span
            className={`text-[10px] font-black px-2 py-1 rounded-full tracking-tighter ${
              hasPromos
                ? "bg-amber-400 text-amber-900 shadow-sm"
                : "bg-white text-purple-400 border border-purple-100"
            }`}
          >
            {badgeLabel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {finalDisplay.map((item, i) => {
            const affiliateUrl = buildAffiliateUrl(item.hotelName, locale);
            const itemRegionI18nKey = REGION_TO_I18N[item.region];
            const itemRegionLabel = itemRegionI18nKey ? tRegions(itemRegionI18nKey) : item.region;

            return (
              <a
                key={i}
                href={affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100 flex flex-col h-full active:scale-[0.98]"
              >
                <div className="aspect-[4/3] relative bg-purple-100 overflow-hidden">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.hotelName}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 text-purple-200">
                      <span className="text-4xl mb-2">🏨</span>
                      <span className="text-[10px] font-bold">{t("imagePreparing")}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span
                          key={j}
                          className={`text-[10px] ${j < item.grade ? "text-amber-400" : "text-gray-200"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="ml-auto text-[10px] font-bold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded">
                      {itemRegionLabel}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
                    {item.hotelName}
                  </h3>

                  <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-snug min-h-[32px]">
                    {item.promoTitle}
                  </p>

                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                    <div
                      className={`text-xs font-black px-2 py-1 rounded ${
                        item.isPromo ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400"
                      }`}
                    >
                      {item.discount}
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                      {t("viewDetail")} <span className="text-xs">→</span>
                    </span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
