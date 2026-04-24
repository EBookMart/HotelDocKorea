"use client";

import Image from "next/image";
import { useState } from "react";
import { MapPin, Star, Phone, Globe, CalendarDays, ArrowRightCircle, Award, ThumbsUp } from "lucide-react";
import { TranslatedText } from "./HomeClient";
import AirportGuide from "./AirportGuide";
import airportRoutesData from "../../public/data/airport-routes.json";
import reputationData from "../../public/data/reputation.json";

function HotelImageCard({ imageUrl, hotelName, rating, city, isLuxury, isBudget, homepageUrl }: {
  imageUrl?: string;
  hotelName: string;
  rating: string;
  city: string;
  isLuxury: boolean;
  isBudget: boolean;
  homepageUrl?: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const stars = parseInt(rating);

  const isInvalidSource = imageUrl?.includes('source.unsplash.com');
  const src = (imageUrl && imageUrl.startsWith('http') && !isInvalidSource) ? imageUrl : null;

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden flex items-center justify-center">
      {!src && (
        <div className="text-center mt-3">
          <span className="text-4xl mb-1 block drop-shadow-sm">🏨</span>
          <span className="text-[11px] font-bold text-purple-400">이미지 준비 중</span>
        </div>
      )}
      
      {src && (
        <>
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-purple-200 via-pink-100 to-purple-200 bg-[length:200%_100%]" />
          )}
          <Image
            src={src}
            alt={hotelName}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoadingComplete={() => setLoaded(true)}
          />
        </>
      )}

      <a 
        href={homepageUrl || '#'} 
        target="_blank" 
        rel="noopener noreferrer" 
        title={`© ${hotelName}, 출처: ${hotelName} 공식 홈페이지`}
        className="absolute inset-0 z-10 block"
      >
        <span className="sr-only">공식 홈페이지로 이동</span>
      </a>

      {(src || !src) && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
      )}
      <div className="absolute top-2 left-2">
        <span className="bg-black/40 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-semibold">
          📍 {city}
        </span>
      </div>
      <div className="absolute top-2 right-2">
        {isLuxury && (
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[9px] px-2 py-0.5 rounded-full font-extrabold shadow-md">
            ★ {stars} {lang === 'ko' ? "성 프리미엄" : "Star Premium"}
          </span>
        )}
        {isBudget && (
          <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
            {stars} {lang === 'ko' ? "성 최저가" : "Star Budget"}
          </span>
        )}
        {!isLuxury && !isBudget && (
          <span className="bg-indigo-500/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
            ★ {stars} {lang === 'ko' ? "성" : "Star"}
          </span>
        )}
      </div>
    </div>
  );
}

export default function HotelSection({ 
  hotelsList, 
  activeRating, 
  lang, 
  t, 
  extractTheme, 
  getPromoTitle,
  sectionTitle
}: any) {
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);

  const toggleGuide = (hotelName: string) => {
    setExpandedHotel(expandedHotel === hotelName ? null : hotelName);
  };

  // 베이지안 랭킹 점수(weightedScore)에 따라 정렬 (Task 2 구현)
  const sortedHotels = [...hotelsList].sort((a: any, b: any) => {
    const repA = (reputationData as any)[a.이름];
    const repB = (reputationData as any)[b.이름];
    const scoreA = repA ? repA.weightedScore : 0;
    const scoreB = repB ? repB.weightedScore : 0;
    return scoreB - scoreA;
  });

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          ⭐ {sectionTitle || '호텔·리조트 프로모션'} 
          <span className="text-indigo-600 font-extrabold bg-indigo-100/50 px-2.5 py-0.5 rounded-md shadow-inner text-sm">{hotelsList.length}</span>
          <span className="text-xs font-normal text-gray-500">{t.unit}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {sortedHotels.length > 0 ? (
          sortedHotels.map((hotel: any, index: number) => {
            const hRating = hotel.rating || activeRating || "3성";
            const isLuxury = hRating === "5성";
            const isBudget = hRating === "3성";
            
            // 평판 데이터 가져오기 (Task 4: Fallback 처리 포함)
            const rep = (reputationData as any)[hotel.이름] || { originalRating: 0, reviewCount: 0 };
            const hasPromo = hotel.promotions && hotel.promotions.length > 0;
            const isTopRanked = index === 0 && !hasPromo; // 프로모션이 없고 1위인 경우 뱃지 대상

            return (
              <div key={index} className={`bg-white rounded-2xl border flex flex-col transition-all hover:-translate-y-1 duration-200 group relative overflow-hidden ${isLuxury ? 'shadow-lg shadow-yellow-500/10 border-yellow-300 ring-1 ring-yellow-100' : 'shadow-sm border-gray-200'}`}>
                <HotelImageCard
                  imageUrl={hotel.imageUrl}
                  hotelName={hotel.이름}
                  rating={hRating}
                  city={hotel.시도}
                  isLuxury={isLuxury}
                  isBudget={isBudget}
                  homepageUrl={hotel.홈페이지 || hotel.official_link}
                />

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="w-[75%]">
                      {isTopRanked && (
                        <div className="flex items-center gap-1.5 mb-2 bg-emerald-50 text-emerald-700 w-fit px-2 py-0.5 rounded-md border border-emerald-100">
                          <Award size={12} className="text-emerald-500 animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {lang === 'ko' ? "여행자가 검증한 최고의 숙소" : "HotelDocKorea's Data-Driven Pick"}
                          </span>
                        </div>
                      )}
                      {!isTopRanked && rep.originalRating >= 4.5 && (
                         <div className="flex items-center gap-1 bg-blue-50 text-blue-600 w-fit px-1.5 py-0.5 rounded-md mb-2 border border-blue-100">
                             <ThumbsUp size={10} />
                             <span className="text-[9px] font-bold">{t.sections.highlyRated}</span>
                         </div>
                      )}
                      
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className={`text-[15px] font-bold leading-snug break-words min-w-0 group-hover:opacity-80 transition-colors ${isLuxury ? 'text-yellow-800' : 'text-gray-900'}`}>
                          <TranslatedText text={hotel['\uc774\ub984']} lang={lang} />
                        </h3>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] mt-1 font-medium tracking-wide w-fit px-2 py-0.5 rounded-md border ${isLuxury ? 'bg-yellow-50/50 border-yellow-100 text-yellow-700' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
                        <MapPin size={10} className={isLuxury ? 'text-yellow-600' : 'text-gray-400'} />
                        {hotel.시도} {hotel.세부지역}
                      </div>
                    </div>
                    {/* Google 평판 데이터 노출 (v, R) */}
                    <div className={`flex flex-col items-end shrink-0 px-2 py-1.5 rounded-xl ${isLuxury ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md shadow-yellow-500/30' : 'bg-gray-50 border border-gray-100'}`}>
                      <div className="flex items-center gap-1">
                        <Star size={13} fill="currentColor" className={isLuxury ? 'text-white' : 'text-yellow-400'} />
                        <span className={`text-[13px] font-black ${isLuxury ? 'text-white' : 'text-gray-800'}`}>
                          {rep.originalRating > 0 ? rep.originalRating : parseInt(hotel.rating || activeRating || "3")}
                        </span>
                      </div>
                      <div className={`text-[9px] font-bold mt-0.5 ${isLuxury ? 'text-yellow-100' : 'text-gray-400'}`}>
                        {rep.reviewCount > 0 ? `${rep.reviewCount.toLocaleString()} Reviews` : 'Verified Info'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2mt-2 pt-3 border-t border-gray-100/80 border-dashed">
                    {hotel.전화번호 && (
                      <a href={`tel:${hotel.전화번호}`} className="flex items-center gap-2 text-[11px] text-gray-600 w-fit mb-2">
                        <Phone size={12} className="text-indigo-400" /> <span>{hotel.전화번호}</span>
                      </a>
                    )}
                    
                    {hotel.promotions && hotel.promotions.length > 0 && (
                      <div className="mt-1 flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold text-rose-500 flex items-center gap-1 bg-rose-50 w-fit px-2 py-0.5 rounded-full">🔥 {t.inProgress}</span>
                        {hotel.promotions.map((promo: any, idx: number) => {
                          const displayTitle = getPromoTitle(promo.title);
                          const theme = extractTheme(promo.title);
                          
                          return (
                            <a href={promo.link} target="_blank" rel="noopener noreferrer" key={idx} className="flex gap-2 bg-gray-50 rounded-xl p-1.5 hover:bg-white transition-all border border-gray-200 shadow-sm relative overflow-hidden">
                               {promo.imageUrl && (
                                 <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200 ring-1 ring-black/5">
                                   <Image src={promo.imageUrl} alt={displayTitle} fill className="object-cover" sizes="48px" />
                                 </div>
                               )}
                               <div className="flex flex-col justify-center flex-1">
                                 {theme && (
                                   <span className={`text-[8px] px-1.5 py-0.5 mb-1 rounded-sm w-fit font-bold border ${theme.color}`}>{theme.label}</span>
                                 )}
                                 <TranslatedText text={displayTitle} lang={lang} className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight" />
                                 <span className="text-[9px] text-gray-500 mt-0.5 font-medium">{promo.period}</span>
                               </div>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    {/* 💰 아고다 수익 모델 고도화: 위젯 스타일 배너 */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1 mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Lowest Price Guarantee</span>
                          <Image src="https://www.agoda.com/favicon.ico" alt="Agoda" width={12} height={12} className="opacity-70" />
                        </div>
                        
                         {(() => {
                            // Geotargeting Logic (based on timezone as proxy for IP Country)
                            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                            const isWestern = timeZone.includes('Europe') || timeZone.includes('America');
                            
                            const bookingUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(hotel.이름)}&aid=2311236`;
                            const agodaUrl = hotel.affiliate_link || `https://www.agoda.com/ko-kr/search?query=${encodeURIComponent(hotel.이름)}&cid=1896000`;
                            
                            // User request: North America/Europe -> Booking, SE Asia/Others -> Agoda
                            const finalAffiliateUrl = isWestern ? bookingUrl : agodaUrl;
                            const providerName = isWestern ? "Booking.com" : "Agoda";

                            return (
                              <a href={finalAffiliateUrl} target="_blank" rel="noopener noreferrer" 
                                 className="relative flex items-center justify-between w-full bg-gradient-to-r from-[#003580] to-[#0051ba] p-3 rounded-xl shadow-lg shadow-blue-900/10 hover:scale-[1.02] transition-all group overflow-hidden">
                                 {/* Shine Effect */}
                                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                 
                                 <div className="flex flex-col items-start z-10">
                                   <span className="text-[10px] text-blue-200 font-medium mb-0.5">
                                      {providerName} {lang === 'ko' ? '실시간 연동 완료' : 'Real-time Linked'}
                                   </span>
                                   <span className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                                     <CalendarDays size={14} className="text-yellow-400" />
                                     <TranslatedText 
                                       text={lang === 'ko' ? "오늘의 최저가 확인하기" : lang === 'ja' ? "本日の最安値を確認" : "Check Today's Lowest Price"} 
                                       lang={lang} 
                                     />
                                   </span>
                                 </div>
                                
                                <div className="bg-yellow-400 text-[#003580] px-3 py-1.5 rounded-lg text-[12px] font-black shadow-sm group-hover:bg-white transition-colors z-10">
                                  GO &gt;
                                </div>
                             </a>
                           );
                        })()}

                        <div className="flex gap-2 mt-1">
                          <a href={hotel.홈페이지 || hotel.official_link || '#'} target="_blank" rel="noopener noreferrer" 
                             className="flex items-center justify-center gap-1.5 flex-1 bg-white border border-gray-200 py-2 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-all">
                             <Globe size={12} className="text-gray-400" /> {t.official}
                          </a>
                          <button 
                             onClick={() => toggleGuide(hotel.이름)}
                             className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                               expandedHotel === hotel.이름 
                               ? 'bg-blue-600 text-white border-blue-600' 
                               : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'
                             }`}
                          >
                             <ArrowRightCircle size={12} className={expandedHotel === hotel.이름 ? 'text-blue-200' : 'text-blue-400'} />
                             {lang === 'ko' ? "공항 이동 가이드" : "Airport Guide"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedHotel === hotel.이름 && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-300">
                    <AirportGuide 
                      hotelName={hotel.이름} 
                      lang={lang} 
                      routeData={(airportRoutesData as any)[hotel.이름]} 
                    />
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="bg-gray-50 p-4 rounded-full mb-3 shadow-inner">
               <MapPin size={24} className="text-gray-300" />
            </div>
            <p className="font-bold text-gray-800 text-sm">{t.empty}</p>
            <p className="text-xs mt-1 text-gray-500 font-medium">{t.emptySub}</p>
          </div>
        )}
      </div>
    </section>
  );
}
