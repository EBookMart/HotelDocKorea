"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MapPin, Globe2, Search, ArrowUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import HotelSection from "./HotelSection";
import FestivalsSection from "./FestivalsSection";
import NearbySection from "./NearbySection";
import HotPicksSection from "./HotPicksSection";
import GradeFilter from "./GradeFilter";
import EmergencyHelpSection from "./EmergencyHelpSection";
import { LANGUAGES } from "@/lib/i18n/translations";
import glossaryData from "@/data/glossary.json";

// ⚠️ Phase 2B-2에서 제거 예정: 하위 컴포넌트가 아직 useTranslations()로 전환되지 않아 임시 유지
const localI18n: any = {
  ko: {
    appTitle: "실시간 호텔 프로모션 가이드",
    searchResult: "검색결과",
    unit: "건",
    empty: "해당 조건의 호텔 프로모션이 없습니다.",
    emptySub: "다른 등급이나 권역을 선택해보세요.",
    official: "공식홈 예약",
    compare: "최저가 비교하기",
    inProgress: "진행중인 프로모션",
    regions: ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도"],
    sections: { highlyRated: "평판 우수" }
  },
  en: {
    appTitle: "Real-time Hotel Promotion Guide",
    searchResult: "Results",
    unit: "places",
    empty: "No promotions found for this filter.",
    emptySub: "Please try a different rating or region.",
    official: "Official Site",
    compare: "Compare Lowest Price",
    inProgress: "Active Promotions",
    regions: ["Seoul Area", "Yeongdong", "Busan/Gyeongnam", "Daegu/Gyeongbuk", "Gwangju/Honam", "Chungcheong", "Jeju"],
    sections: { highlyRated: "Highly Rated" }
  },
  ja: {
    appTitle: "リアルタイムホテルプロモガイド",
    searchResult: "検索結果",
    unit: "件",
    empty: "この条件に一致するプロモーションがありません。",
    emptySub: "別のランクまたは地域を選択してください。",
    official: "公式サイト",
    compare: "最安値を比較",
    inProgress: "実施中のプロモ",
    regions: ["首都圏", "嶺東", "釜山・慶南", "大邱・慶北", "光州・湖南", "忠清", "済州島"],
    sections: { highlyRated: "評判が良い" }
  },
  zh: {
    appTitle: "实时酒店促销指南",
    searchResult: "搜索结果",
    unit: "条",
    empty: "该条件下没有酒店促销。",
    emptySub: "请尝试其他评级或地区。",
    official: "官方预订",
    compare: "比较最低价",
    inProgress: "进行中的促销",
    regions: ["首都圈", "岭东", "釜山·庆南", "大邱·庆北", "光州·湖南", "忠清", "济州岛"],
    sections: { highlyRated: "评价极佳" }
  },
  es: {
    appTitle: "Guía de promociones de hoteles en tiempo real",
    searchResult: "Resultados",
    unit: "lugares",
    empty: "No se encontraron promociones con este filtro.",
    emptySub: "Por favor, prueba con otra categoría o región.",
    official: "Sitio oficial",
    compare: "Comparar precio más bajo",
    inProgress: "Promociones activas",
    regions: ["Área de Seúl", "Costa Este", "Busan/Gyeongnam", "Daegu/Gyeongbuk", "Gwangju/Honam", "Chungcheong", "Jeju"],
    sections: { highlyRated: "Muy valorado" }
  }
};

// 권역 데이터 키(한국어)와 i18n 키의 매핑 — 인덱스로 연결
const regionKeys = ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도"];
const regionI18nKeys = ["capital", "yeongdong", "busan", "daegu", "honam", "chungcheong", "jeju"];
const ratings = ["5성", "4성", "3성"];

function resolveTitle(titleData: any): string {
  if (!titleData) return "";
  if (typeof titleData === "string") return titleData;
  if (typeof titleData === "object") return titleData.ko || titleData.en || "";
  return "";
}

// ─────────────────────────────────────────
// 🌐 번역 엔진 (Phase 2B-3에서 빌드 타임 번역으로 전환 예정)
// ─────────────────────────────────────────
const sessionCache = new Map<string, string>();
const CACHE_PREFIX = 'hdktrans_';

function getCacheKey(text: string, lang: string) {
  return `${CACHE_PREFIX}${lang}_${text.slice(0, 30)}`;
}

function normalizeText(text: string) {
  return text.toLowerCase().replace(/\s+/g, '');
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'ko') return text;

  const normalizedInput = normalizeText(text);
  const glossary: Record<string, string> = glossaryData;

  for (const [key, value] of Object.entries(glossary)) {
    if (normalizeText(key) === normalizedInput) {
      return value;
    }
  }

  const key = getCacheKey(text, targetLang);
  if (sessionCache.has(key)) return sessionCache.get(key)!;

  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      sessionCache.set(key, cached);
      return cached;
    }
  } catch (_) { }

  const langPair = `ko|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText || text;

    sessionCache.set(key, translated);
    try { localStorage.setItem(key, translated); } catch (_) { }

    return translated;
  } catch (err) {
    console.warn('[Translation] API 호출 실패, 한국어 원문 표시:', text);
    return text;
  }
}

export function TranslatedText({
  text,
  lang,
  className = '',
}: {
  text: string;
  lang: string;
  className?: string;
}) {
  const [translated, setTranslated] = useState<string>(text);
  const [loading, setLoading] = useState(false);
  const prevLang = useRef(lang);

  useEffect(() => {
    if (lang === 'ko') {
      setTranslated(text);
      return;
    }
    prevLang.current = lang;

    const key = getCacheKey(text, lang);
    const cached = sessionCache.get(key) ?? (typeof window !== 'undefined' ? localStorage.getItem(key) : null);
    if (cached) {
      setTranslated(cached);
      return;
    }

    setLoading(true);
    translateText(text, lang).then(result => {
      setTranslated(result);
      setLoading(false);
    });
  }, [text, lang]);

  if (loading) {
    return <span className={`inline-block h-4 w-24 rounded bg-gray-200 animate-pulse ${className}`} />;
  }

  return <span className={className}>{translated}</span>;
}

export default function HomeClient({ hotelData }: { hotelData: any }) {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();

  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const activeRegionKey = activeRegionIndex !== null ? regionKeys[activeRegionIndex] : null;

  let hotelsList: any[] = [];
  const regionsToProcess = activeRegionKey ? [activeRegionKey] : regionKeys;

  regionsToProcess.forEach(region => {
    const hotelRegionData = hotelData[region] || {};
    if (selectedGrade !== null) {
      const key = `${selectedGrade}성`;
      const list = (hotelRegionData[key] || []).map((h: any) => ({ ...h, rating: key, region }));
      hotelsList = hotelsList.concat(list);
    } else {
      Object.keys(hotelRegionData).forEach(ratingKey => {
        const list = hotelRegionData[ratingKey].map((h: any) => ({ ...h, rating: ratingKey, region }));
        hotelsList = hotelsList.concat(list);
      });
    }
  });

  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().replace(/\s+/g, "");
    hotelsList = hotelsList.filter((h: any) => {
      const searchableText = [
        h.이름, h.name, h.hotelName, h.address, h.주소, h.region,
        h.권역, h.city, h.세부지역, h.tourApiAddress, h.tourApiTitle
      ].filter(Boolean).join(" ").toLowerCase().replace(/\s+/g, "");
      return searchableText.includes(q);
    });
  }

  if (selectedGrade === null) {
    hotelsList.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
  }

  const legacyT = localI18n[locale] || localI18n.en;

  const extractTheme = (titleData: any) => {
    const title = resolveTitle(titleData).toLowerCase();
    if (!title) return null;
    if (title.includes('조식') || title.includes('breakfast')) return { label: "조식포함", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (title.includes('수영') || title.includes('워터') || title.includes('pool')) return { label: "수영장", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (title.includes('얼리버드') || title.includes('early')) return { label: "얼리버드", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (title.includes('골프') || title.includes('golf')) return { label: "골프패키지", color: "bg-green-100 text-green-700 border-green-200" };
    return null;
  };

  const getPromoTitle = (titleObj: any) => {
    if (!titleObj) return "";
    if (typeof titleObj === "string") return titleObj;
    return titleObj[locale] || titleObj.ko || "";
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="HotelDocKorea"
                width={56}
                height={56}
                className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
                priority
              />
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
                  {t('brandName')}
                </h1>
                <p className="text-xs sm:text-sm opacity-85 mt-0.5">
                  {t('subtitle')}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 px-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-white/10 rounded-full p-1 h-fit">
                  {LANGUAGES.map((l) => (
                    <Link
                      key={l.code}
                      href={pathname}
                      locale={l.code as any}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition ${
                        locale === l.code
                          ? "bg-white text-purple-700 font-semibold shadow-sm"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                      aria-label={`Switch to ${l.shortLabel}`}
                    >
                      <span className="text-sm">{l.flag}</span>
                      <span className="hidden sm:inline-block tracking-tight">{l.shortLabel}</span>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => document.getElementById('emergency-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-full text-xs font-black shadow-lg shadow-red-900/20 flex items-center gap-2 animate-bounce-subtle transition-all active:scale-95"
                >
                  <span className="text-sm">🚨</span>
                  <span className="hidden md:inline">{t('header.emergencyButton')}</span>
                </button>
              </div>

            </div>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-5 pb-1">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveRegionIndex(null)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow flex items-center gap-1.5 ${
                  activeRegionIndex === null
                    ? "bg-white text-indigo-700 font-bold shadow-md"
                    : "bg-white/10 text-indigo-100 border border-white/20 hover:bg-white/20 active:scale-95 backdrop-blur-sm"
                }`}
              >
                <Globe2 size={14} className={activeRegionIndex === null ? "text-blue-500" : "text-indigo-300"} />
                {t('header.allRegions')}
              </button>
              {regionI18nKeys.map((i18nKey, index) => (
                <button
                  key={index}
                  onClick={() => setActiveRegionIndex(index)}
                  className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 shadow flex items-center gap-1.5 ${
                    activeRegionIndex === index
                      ? "bg-white text-indigo-700 font-bold shadow-md"
                      : "bg-white/10 text-indigo-100 border border-white/20 hover:bg-white/20 active:scale-95 backdrop-blur-sm"
                  }`}
                >
                  <MapPin size={14} className={activeRegionIndex === index ? "text-blue-500" : "text-indigo-300"} />
                  {t(`regions.${i18nKey}`)}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-indigo-200 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                placeholder={t('header.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 text-sm rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all backdrop-blur-sm shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-white transition-colors"
                >
                  <span className="text-lg leading-none">×</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 pb-24">
        <GradeFilter
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
          totalCount={hotelsList.length}
        />

        <HotPicksSection
          selectedRegion={activeRegionKey}
          selectedGrade={selectedGrade}
          fallbackHotels={hotelsList}
        />

        <section className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <FestivalsSection selectedRegion={activeRegionKey} />
              <NearbySection selectedRegion={activeRegionKey} />
            </div>
          </div>
        </section>

        <section className="w-full bg-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-10">
            <HotelSection
              hotelsList={hotelsList}
              activeRating={selectedGrade ? `${selectedGrade}성` : null}
              lang={locale as any}
              t={legacyT}
              extractTheme={extractTheme}
              getPromoTitle={getPromoTitle}
              sectionTitle={t('hotels.fullPromotionsTitle', { count: hotelsList.length })}
            />
          </div>
        </section>

        <section className="w-full bg-white py-14">
          <div className="max-w-7xl mx-auto px-4 lg:px-10">
            <EmergencyHelpSection />
          </div>
        </section>


        <footer className="w-full bg-purple-900 text-purple-200 py-10">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs">
            <div className="flex justify-center gap-6 mb-4">
              <Link href="/terms" className="hover:text-white underline underline-offset-2 transition-colors">
                {t('footer.terms')}
              </Link>
              <Link href="/privacy" className="hover:text-white underline underline-offset-2 transition-colors font-bold">
                {t('footer.privacy')}
              </Link>
            </div>
            <p className="mb-4 leading-relaxed max-w-4xl mx-auto px-4 text-purple-300 opacity-80">
              {t('footer.imageNotice')}
            </p>
            <p className="opacity-60">{t('footer.copyright')}</p>
          </div>
        </footer>
      </main>

      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[100] bg-indigo-600 text-white p-4 rounded-full shadow-2xl shadow-indigo-900/40 hover:bg-indigo-700 hover:scale-110 active:scale-95 transition-all animate-in fade-in zoom-in slide-in-from-bottom-5 duration-300 flex items-center justify-center group"
          aria-label="Back to Top"
        >
          <ArrowUp size={24} className="group-hover:-translate-y-1 transition-transform" />
        </button>
      )}
    </div>
  );
}
