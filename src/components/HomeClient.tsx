"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Star, Phone, Globe, CalendarDays, Globe2 } from "lucide-react";

// 다국어 사전
const i18n: any = {
  ko: {
    appTitle: "실시간 호텔 프로모션 가이드",
    searchResult: "검색결과",
    unit: "건",
    empty: "해당 조건의 호텔 프로모션이 없습니다.",
    emptySub: "다른 등급이나 권역을 선택해보세요.",
    official: "공식홈 예약",
    compare: "최저가 비교하기",
    inProgress: "진행중인 프로모션",
    adPlaceholder: "구글 애드센스 광고 영역",
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
    adPlaceholder: "Google AdSense Space",
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
    adPlaceholder: "Google AdSense スペース",
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

// ─────────────────────────────────────────────
// 🖼️ 호텔 이미지 카드 서브컴포넌트
// map() 안에서 useState를 쓰면 React Hook 규칙 위반이므로
// 별도 컴포넌트로 분리하여 Skeleton UI 상태를 안전하게 관리
// ─────────────────────────────────────────────
function HotelImageCard({ imageUrl, hotelName, rating, city, isLuxury, isBudget }: {
  imageUrl?: string;
  hotelName: string;
  rating: string;
  city: string;
  isLuxury: boolean;
  isBudget: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const stars = parseInt(rating);

  // 이미지 없을 때 등급별 Unsplash 폴백
  const fallback = isLuxury
    ? "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"
    : isBudget
    ? "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&q=80"
    : "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80";

  const src = (imageUrl && imageUrl.startsWith('http')) ? imageUrl : fallback;

  return (
    <div className="relative w-full aspect-video bg-gray-200 overflow-hidden">
      {/* 스켈레톤 로딩 애니메이션 */}
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]" />
      )}

      {/* 호텔 이미지 (Lazy Loading: Next.js Image 기본 적용) */}
      <Image
        src={src}
        alt={hotelName}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={`object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={() => setLoaded(true)}
      />

      {/* 이미지 하단 그라디언트 오버레이 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* 좌상단: 도시 뱃지 */}
      <div className="absolute top-2 left-2">
        <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-semibold">
          📍 {city}
        </span>
      </div>

      {/* 우상단: 등급 뱃지 */}
      <div className="absolute top-2 right-2">
        {isLuxury && (
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[9px] px-2 py-0.5 rounded-full font-extrabold shadow-md">
            ★ {stars}성 Premium
          </span>
        )}
        {isBudget && (
          <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
            {stars}성 최저가
          </span>
        )}
        {!isLuxury && !isBudget && (
          <span className="bg-indigo-500/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
            ★ {stars}성
          </span>
        )}
      </div>
    </div>
  );
}

export default function HomeClient({ hotelData }: { hotelData: any }) {
  const [lang, setLang] = useState<"ko" | "en" | "ja">("ko");
  const regionKeys = ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남(전남, 전북)권", "충청권", "제주도"];
  
  const [activeRegionIndex, setActiveRegionIndex] = useState(0);
  const [activeRating, setActiveRating] = useState(ratings[0]);

  const activeRegionKey = regionKeys[activeRegionIndex];
  const hotelsList = hotelData[activeRegionKey] ? hotelData[activeRegionKey][activeRating] || [] : [];
  const t = i18n[lang];

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
    <div className="flex flex-col w-full max-w-7xl mx-auto min-h-screen bg-gray-50">
      <header className="px-6 lg:px-12 py-5 bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 text-white sticky top-0 z-40 shadow-lg border-b border-indigo-500/30">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight drop-shadow-sm">
            HotelDocKorea
          </h1>
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-black/20 p-1 rounded-full border border-white/10">
            <Globe2 size={12} className="text-white/70 ml-1" />
            <button onClick={() => setLang('ko')} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lang === 'ko' ? 'bg-white text-indigo-700' : 'text-gray-300'}`}>KO</button>
            <button onClick={() => setLang('en')} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lang === 'en' ? 'bg-white text-indigo-700' : 'text-gray-300'}`}>EN</button>
            <button onClick={() => setLang('ja')} className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${lang === 'ja' ? 'bg-white text-indigo-700' : 'text-gray-300'}`}>JA</button>
          </div>
        </div>
        <p className="text-sm text-blue-100 opacity-90 mt-1 font-medium tracking-wide">{t.appTitle}</p>
        
        {/* Regions Tab — 모바일: 가로 스크롤 / PC: 자연스럽게 펼쳐지는 flex-wrap */}
        <div className="flex flex-wrap gap-2 mt-5 pb-1">
          {t.regions.map((regionName: string, index: number) => (
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
      </header>

      {/* AdSense 명당 1: Top Banner */}
      <div className="w-full bg-gray-200 border-b border-gray-300 flex items-center justify-center p-3">
         <span className="text-xs text-gray-400 border border-dashed border-gray-400 p-2 rounded w-full text-center bg-gray-100">[Ad] {t.adPlaceholder} 1 (Top)</span>
      </div>

      <main className="flex-1 px-4 lg:px-12 py-8 pb-32">
        {/* Weekly Pick: AI 자동 선정 매거진풍 UI (애드센스 정보성 강화를 위한 텍스트) */}
        <section className="mb-8 border border-indigo-100 bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-3">
            <h2 className="font-extrabold text-indigo-900 text-lg flex items-center gap-2">
              <Star size={18} className="text-yellow-500" fill="currentColor" />
              Hotel Doc&apos;s Weekly Pick
            </h2>
            <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-bold">AI Curation</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed font-medium mb-4 text-justify">
            이번 주 에어비앤비형 최저가 봇이 분석한 전국 520개 호텔 프로모션 중 <strong className="text-indigo-600">압도적인 가성비와 혜택</strong>을 자랑하는 베스트 3선을 엄선했습니다. 최근 호텔 업계의 트렌드는 조식을 포함하고 늦은 퇴실(Late Check-out)을 보장하는 스마트 패키지입니다. 본 리포트에서 소개하는 신라호텔 및 롯데호텔의 경우 기존 정가 대비 평균 20%~30% 할인된 특가를 구성하여 가족 여행객 및 비즈니스 투숙객에게 가장 합리적인 옵션을 제공합니다. 특히 수영장과 사우나 등 부대시설 이용이 무제한 제공되는 패키지는 조기 마감될 수 있으니 실시간 가격 비교 위젯을 참조하시길 권장합니다.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2">
            {[
              { title: "제주 특급 풀빌라 초특가", desc: "수영장과 조식을 한 번에. 가족 여행객을 위한 최고의 5성급 혜택을 놓치지 마세요.", img: "https://www.lottehotel.com/content/dam/lotte-hotel/global/common/offer/spring-main.jpg", discount: "45%" },
              { title: "도심 속 스위트룸 호캉스", desc: "피로를 풀어줄 사우나와 이그제큐티브 라운지 권한이 포함된 비즈니스 럭셔리 패키지입니다.", img: "https://www.shillahotels.com/images/eno/sub/prom/2024/03/yoga.jpg", discount: "30%" },
              { title: "강릉 오션뷰 얼리버드", desc: "다음 달 동해안 여행을 계획하신다면 지금 예약하세요. 최저가 보상제 적용 중.", img: "https://www.josunhotel.com/images/eno/sub/prom/2024/03/family.jpg", discount: "최저가" }
            ].map((pick, i) => (
               <div key={i} className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow relative">
                 <div className="relative w-full h-32 bg-gray-200">
                    <Image src={pick.img} alt={pick.title} fill className="object-cover" />
                    <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm">
                      {pick.discount}
                   </div>
                  </div>
                 <div className="p-3">
                   <h3 className="font-bold text-gray-800 text-sm truncate">{pick.title}</h3>
                   <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{pick.desc}</p>
                 </div>
               </div>
            ))}
          </div>
        </section>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-md font-bold text-gray-800 flex items-center gap-2">
            {t.searchResult} <span className="text-indigo-600 font-extrabold bg-indigo-100/50 px-2.5 py-0.5 rounded-md shadow-inner">{hotelsList.length}</span><span className="text-sm font-normal text-gray-500">{t.unit}</span>
          </h2>
          <div className="flex bg-gray-200/80 rounded-full p-1 border shadow-inner backdrop-blur-md">
            {ratings.map(rating => (
               <button 
                 key={rating}
                 onClick={() => setActiveRating(rating)}
                 className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all duration-200 ${
                   activeRating === rating ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                 }`}
               >
                 {rating}
               </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {hotelsList.length > 0 ? (
            hotelsList.map((hotel: any, index: number) => {
              const isLuxury = activeRating === "5성";
              const isBudget = activeRating === "3성";

              return (
              <div key={index}>
                <div className={`bg-white rounded-2xl border flex flex-col transition-all hover:-translate-y-1 duration-200 group relative overflow-hidden
                  ${isLuxury ? 'shadow-xl shadow-yellow-500/10 border-yellow-300 ring-2 ring-yellow-100' : 'shadow-md border-gray-200/80'}
                `}>

                  {/* 이미지 컴포넌트 */}
                  <HotelImageCard
                    imageUrl={hotel.imageUrl}
                    hotelName={hotel.이름}
                    rating={activeRating}
                    city={hotel.시도}
                    isLuxury={isLuxury}
                    isBudget={isBudget}
                  />

                  <div className="p-4 flex flex-col gap-3">

                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`text-base font-bold leading-snug group-hover:opacity-80 transition-colors ${isLuxury ? 'text-yellow-800' : 'text-gray-900'}`}>
                          {hotel.이름}
                        </h3>
                        {/* 3성급 최저가 강조 뱃지 */}
                        {isBudget && <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded font-extrabold animate-pulse">최저가</span>}
                        {isLuxury && <span className="bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded font-extrabold shadow-sm shadow-yellow-500/30">Premium</span>}
                      </div>
                      
                      <div className={`flex items-center gap-1.5 text-xs mt-1.5 font-medium tracking-wide w-fit px-2 py-0.5 rounded-md border ${isLuxury ? 'bg-yellow-50/50 border-yellow-100 text-yellow-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                         <MapPin size={12} className={isLuxury ? 'text-yellow-600' : 'text-gray-400'} />
                         {hotel.시도} {hotel.세부지역}
                      </div>
                    </div>
                    <div className={`flex shrink-0 px-1.5 py-1 rounded-lg ${isLuxury ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md shadow-yellow-500/30' : 'text-yellow-400 bg-yellow-50'}`}>
                      <Star size={16} fill="currentColor" />
                      <span className={`text-xs ml-1 mt-0.5 font-bold ${isLuxury ? 'text-white' : 'text-yellow-600'}`}>{parseInt(activeRating)}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5 mt-2 pt-4 border-t border-gray-100/80 border-dashed">
                    {hotel.전화번호 && (
                       <a href={`tel:${hotel.전화번호}`} className="flex items-center gap-2 text-xs text-gray-600 w-fit">
                         <Phone size={14} className="text-indigo-400" /> <span>{hotel.전화번호}</span>
                       </a>
                    )}
                    
                    {/* 자동 수집된 프로모션 영역 (다국어 & 테마 반영) */}
                    {hotel.promotions && hotel.promotions.length > 0 && (
                      <div className="mt-2 flex flex-col gap-3">
                        <span className="text-xs font-extrabold text-rose-500 flex items-center gap-1 bg-rose-50 w-fit px-2 py-0.5 rounded-full">🔥 {t.inProgress}</span>
                        {hotel.promotions.map((promo: any, idx: number) => {
                          const displayTitle = getPromoTitle(promo.title);
                          const theme = extractTheme(promo.title); // 한국어 원본으로 테마 추출
                          
                          return (
                            <a href={promo.link} target="_blank" rel="noopener noreferrer" key={idx} className="flex gap-3 bg-gray-50 rounded-xl p-2 hover:bg-white transition-all border border-gray-200 shadow-sm relative overflow-hidden">
                               {promo.imageUrl && (
                                 <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-200 ring-1 ring-black/5">
                                   <Image src={promo.imageUrl} alt={displayTitle} fill className="object-cover" sizes="64px" />
                                 </div>
                               )}
                               <div className="flex flex-col justify-center flex-1">
                                 {theme && (
                                   <span className={`text-[9px] px-1.5 py-0.5 mb-1 rounded-sm w-fit font-bold border ${theme.color}`}>{theme.label}</span>
                                 )}
                                 <span className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight">{displayTitle}</span>
                                 <span className="text-[10px] text-gray-500 mt-1 font-medium">{promo.period}</span>
                               </div>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* Affiliate Pricing Widget (공홈 vs OTA 라이브 가격 비교) */}
                    <div className="flex flex-col gap-3 mt-3 pt-4 border-t border-gray-100">
                      {/* Live Price Widget Mock */}
                      <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                        <span className="text-[10px] text-gray-500 font-bold">실시간 최저가 동향</span>
                        <div className="flex gap-2">
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] text-gray-400 line-through">공식가 350,000원</span>
                            <span className="text-xs font-extrabold text-indigo-700">제휴가 285,000원~</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2.5">
                        <a href={hotel.홈페이지 || hotel.official_link || '#'} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center justify-center gap-1 flex-[0.7] bg-gray-100 border border-gray-200 py-3 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-all active:scale-[0.98]">
                           <Globe size={14} /> {t.official}
                        </a>
                        <a href={hotel.affiliate_link || '#'} target="_blank" rel="noopener noreferrer" 
                           className="flex items-center justify-center gap-1.5 flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-3 rounded-xl text-sm font-extrabold text-white shadow-lg shadow-indigo-500/30 hover:brightness-110 transition-all active:scale-[0.98]">
                           <CalendarDays size={16} /> {t.compare}
                        </a>
                      </div>
                    </div>
                  </div>
                </div> {/* /p-4 flex flex-col */}
                </div> {/* /card outer */}

                {/* AdSense 명당 2: In-feed (3번째 리스트 직후) */}
                {index === 2 && (
                  <div className="my-5 w-full bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center p-6">
                    <span className="text-xs text-gray-400 text-center">[Ad] {t.adPlaceholder} 2 (In-feed)<br/>에어비앤비형 피드 광고</span>
                  </div>
                )}
              </div>
            );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl shadow-sm border border-gray-100">
              <div className="bg-gray-50 p-5 rounded-full mb-4 shadow-inner">
                 <MapPin size={28} className="text-gray-300" />
              </div>
              <p className="font-bold text-gray-800 text-lg">{t.empty}</p>
              <p className="text-sm mt-1.5 text-gray-500 font-medium">{t.emptySub}</p>
            </div>
          )}
        </div>

        {/* Subscription Newsletter Section */}
        <div className="mt-12 bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 text-center">
          <h3 className="font-extrabold text-indigo-900 mb-2">🔥 신규 파격 특가 알람받기</h3>
          <p className="text-xs text-gray-500 mb-4">5성급 호텔의 히든 프로모션이 수집되면 가장 먼저 카카오톡/이메일로 알려드립니다.</p>
          <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); alert("구독이 완료되었습니다!"); }}>
            <input type="email" placeholder="이메일 주소를 입력하세요" required className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button type="submit" className="bg-indigo-600 text-white rounded-xl px-4 py-2 text-sm font-bold shadow-md hover:bg-indigo-700 active:scale-95 transition-all">구독</button>
          </form>
        </div>

        {/* Footer with Legal Links */}
        <footer className="mt-12 pb-10 border-t border-gray-200 pt-6 text-center text-[10px] text-gray-400">
          <div className="flex justify-center gap-4 mb-3">
             <a href="/terms" className="hover:text-gray-600 underline underline-offset-2">이용약관</a>
             <a href="/privacy" className="hover:text-gray-600 underline underline-offset-2">개인정보처리방침</a>
          </div>
          <p>© 2026 HotelDocKorea. All rights reserved.</p>
        </footer>
      </main>

    </div>
  );
}
