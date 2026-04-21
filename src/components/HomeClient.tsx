"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { MapPin, Globe2, Search } from "lucide-react";
import HotelSection from "./HotelSection";
import FestivalsSection from "./FestivalsSection";
import NearbySection from "./NearbySection";
import WeatherSection from "./WeatherSection";
import HotPicksSection from "./HotPicksSection";
import GradeFilter from "./GradeFilter";
import { LANGUAGES, translations, type Language } from "@/lib/i18n/translations";

// 하위 호환성 (HotelSection 내부 사용)
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
    regions: ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도"]
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
    regions: ["Seoul Area", "Yeongdong", "Busan/Gyeongnam", "Daegu/Gyeongbuk", "Gwangju/Honam", "Chungcheong", "Jeju"]
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
    regions: ["首都圏", "嶺東", "釜山・慶南", "大邱・慶北", "光州・湖南", "忠清", "済州島"]
  }
};

const ratings = ["5성", "4성", "3성"];

// title이 string일 수도, {ko,en,ja} 객체일 수도 있어서 
// 어디서나 안전하게 한국어 문자열로 추출하는 전역 유틸 함수
function resolveTitle(titleData: any): string {
  if (!titleData) return "";
  if (typeof titleData === "string") return titleData;
  if (typeof titleData === "object") return titleData.ko || titleData.en || "";
  return "";
}

// ─────────────────────────────────────────
// 🌐 번역 엔진: MyMemory API (무료, API키 불필요)
// - 한 번 번역된 내용은 localStorage에 저장 (화면 이동 후에도 즐시 표시)
// - 세션 Map으로 추가 캐싱 (페이지 내 돈타린 API 호출 방지)
// - API 실패 시 한국어 원문(fallback) 표시
// ─────────────────────────────────────────

// 세션 쫋번째 혹은 다른 탭에서 호출될 수 있어 모듈 레벨 Map으로 유지
const sessionCache = new Map<string, string>();

// localStorage 키 접두어
const CACHE_PREFIX = 'hdktrans_';

function getCacheKey(text: string, lang: string) {
  return `${CACHE_PREFIX}${lang}_${text.slice(0, 30)}`;
}

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || targetLang === 'ko') return text;

  const key = getCacheKey(text, targetLang);

  // 1. 세션 Map 캐시 확인 (가장 빠름)
  if (sessionCache.has(key)) return sessionCache.get(key)!;

  // 2. localStorage 해시 연결리스트 캐시 확인 (종료 후에도 유지)
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      sessionCache.set(key, cached);
      return cached;
    }
  } catch (_) { }

  // 3. MyMemory 무료 번역 API 호출
  // 언어 코드: ko→en | ko→ja
  const langPair = `ko|${targetLang}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    const translated: string = data?.responseData?.translatedText || text;

    // 두 연소에 저장
    sessionCache.set(key, translated);
    try { localStorage.setItem(key, translated); } catch (_) { }

    return translated;
  } catch (err) {
    console.warn('[Translation] API 호출 실패, 한국어 원문 표시:', text);
    return text; // Fallback: 한국어 원문
  }
}

// ─────────────────────────────────────────
// 🌐 TranslatedText 컴포넌트
// - 한 구열의 텍스트를 스켈레톤 로딩 후 번역 될 것
// - lang === 'ko'이면 번역 없이 원문 바로 표시
// - 진행체 네임는 className으로 외부에서 주입하여 재사용 가능
// ─────────────────────────────────────────

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

    // 캐시 먼저 확인 (API 호출 최소화)
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
  const [lang, setLang] = useState<Language>("ko");
  // local legacy mapping
  const regionKeys = ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도"];

  const [activeRegionIndex, setActiveRegionIndex] = useState<number | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Alert handler for mock languages
  const handleUnsupportedLang = (e: React.MouseEvent, l: string) => {
    e.preventDefault();
    alert("다국어 번역 준비 중입니다.");
  };

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

  // 검색어 필터링 확장: 이름 + 주소 + 지역명 통합 검색
  if (searchQuery.trim() !== "") {
    const q = searchQuery.toLowerCase().replace(/\s+/g, "");
    hotelsList = hotelsList.filter((h: any) => {
      const name = resolveTitle(h.name || h.hotelName || h.호텔명 || "").toLowerCase().replace(/\s+/g, "");
      const addr = (h.address || h.주소 || "").toLowerCase().replace(/\s+/g, "");
      const region = (h.region || "").toLowerCase().replace(/\s+/g, "");
      
      return name.includes(q) || addr.includes(q) || region.includes(q);
    });
  }

  if (selectedGrade === null) {
    // 내림차순 정렬 (5성 -> 4성 -> 3성)
    hotelsList.sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
  }
  
  // Legacy t for sub-components
  const legacyT = localI18n[lang] || localI18n.ko;
  const t = translations[lang];

  // 테마 추출기 - resolveTitle로 항상 안전한 string 확보
  const extractTheme = (titleData: any) => {
    const title = resolveTitle(titleData).toLowerCase();
    if (!title) return null;
    if (title.includes('조식') || title.includes('breakfast')) return { label: "조식포함", color: "bg-orange-100 text-orange-700 border-orange-200" };
    if (title.includes('수영') || title.includes('워터') || title.includes('pool')) return { label: "수영장", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (title.includes('얼리버드') || title.includes('early')) return { label: "얼리버드", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (title.includes('골프') || title.includes('golf')) return { label: "골프패키지", color: "bg-green-100 text-green-700 border-green-200" };
    return null;
  };

  // 다국어 타이틀 추출 - resolveTitle 기반
  const getPromoTitle = (titleObj: any) => {
    if (!titleObj) return "";
    if (typeof titleObj === "string") return titleObj;
    return titleObj[lang] || titleObj.ko || "";
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="bg-gradient-to-r from-purple-700 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-12 py-6">
          <div className="flex items-center justify-between">
            {/* 로고 + 브랜드 텍스트 */}
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
                  {t.brandName}
                </h1>
                <p className="text-xs sm:text-sm opacity-85 mt-0.5">
                  {t.subtitle}
                </p>
              </div>
            </div>

            {/* 언어 전환 버튼 5개 */}
            <div className="flex items-center gap-1 bg-white/10 rounded-full p-1">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as Language)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs transition ${
                    lang === l.code
                      ? "bg-white text-purple-700 font-semibold shadow-sm"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-label={`Switch to ${l.shortLabel}`}
                >
                  <span className="text-sm">{l.flag}</span>
                  <span className="hidden sm:inline-block tracking-tight">{l.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Regions Tab & Search Interface */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-5 pb-1">
            {/* Regions Tab — 모바일: 가로 스크롤 / PC: 자연스럽게 펼쳐지는 flex-wrap */}
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
                전국
              </button>
              {Object.values(t.regions).map((regionName: string, index: number) => (
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
                  {regionName}
                </button>
              ))}
            </div>

            {/* 오른쪽 끝 검색창 */}
            <div className="relative w-full lg:w-72 group">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search size={16} className="text-indigo-200 group-focus-within:text-white transition-colors" />
              </div>
              <input
                type="text"
                placeholder="호텔 이름을 검색해 보세요"
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
        {/* 새롭게 도입된 전면 등급 필터 */}
        <GradeFilter
          selectedGrade={selectedGrade}
          onGradeChange={setSelectedGrade}
          totalCount={hotelsList.length}
        />
        
        {/* ⭐ 전폭 HOT 프로모션 */}
        <HotPicksSection 
          selectedRegion={activeRegionKey} 
          selectedGrade={selectedGrade} 
          fallbackHotels={hotelsList}
        />
        
        {/* 📅 좌축 / 🍜 우측 분할 (배경: 흰색) */}
        <section className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
              <FestivalsSection selectedRegion={activeRegionKey} />
              <NearbySection selectedRegion={activeRegionKey} />
            </div>
          </div>
        </section>

        {/* 🏨 호텔 목록 (배경: 연한 회색) */}
        <section className="w-full bg-gray-100 py-10">
          <div className="max-w-7xl mx-auto px-4 lg:px-10">
            <HotelSection 
              hotelsList={hotelsList} 
              activeRating={selectedGrade ? `${selectedGrade}성` : null} 
              lang={lang} 
              t={legacyT} 
              extractTheme={extractTheme} 
              getPromoTitle={getPromoTitle} 
              sectionTitle={`호텔·리조트 전체 프로모션 ${hotelsList.length}건`}
            />
          </div>
        </section>

        {/* 🌤️ 전폭 기상 (최하단으로 이동) */}
        <section className="w-full bg-sky-50/50 border-y border-sky-100">
          <div className="max-w-7xl mx-auto px-4 lg:px-10 py-10">
            <WeatherSection sectionTitle={t.sections.weather} />
          </div>
        </section>

        {/* Subscription Newsletter Section (배경: 흰색) */}
        <section className="w-full bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 py-16 text-center">
            <h3 className="font-extrabold text-indigo-900 mb-2 text-xl">🔥 신규 파격 특가 알람받기</h3>
            <p className="text-sm text-gray-500 mb-6">5성급 호텔의 히든 프로모션이 수집되면 가장 먼저 카카오톡/이메일로 알려드립니다.</p>
            <form className="flex gap-2 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert("구독이 완료되었습니다!"); }}>
              <input type="email" placeholder="이메일 주소를 입력하세요" required className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="submit" className="bg-indigo-600 text-white rounded-xl px-6 py-3 text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all w-24">구독</button>
            </form>
          </div>
        </section>

        {/* 푸터 (배경: 짙은 보라) */}
        <footer className="w-full bg-purple-900 text-purple-200 py-10">
          <div className="max-w-7xl mx-auto px-4 text-center text-xs">
            <div className="flex justify-center gap-6 mb-4">
              <a href="/terms" className="hover:text-white underline underline-offset-2 transition-colors">이용약관</a>
              <a href="/privacy" className="hover:text-white underline underline-offset-2 transition-colors font-bold">개인정보처리방침</a>
            </div>
            <p className="mb-4 leading-relaxed max-w-4xl mx-auto px-4 text-purple-300 opacity-80">
              [안내] 본 사이트에 표시된 호텔 이미지는 각 호텔 공식 홈페이지의 공개 메타데이터(Open Graph)를 실시간으로 인용하며, 저작권은 각 호텔에 있습니다. 이미지 게재 중단을 원하시는 호텔은 연락주시면 즉시 제외하겠습니다. (연락처: contact@hoteldockorea.com)
            </p>
            <p className="opacity-60">© 2026 HotelDocKorea. All rights reserved.</p>
          </div>
        </footer>
      </main>

    </div>
  );
}
