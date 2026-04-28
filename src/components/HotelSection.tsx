"use client";

import Image from "next/image";
import { useState } from "react";
import {
  MapPin, Star, Phone, Globe, CalendarDays, ArrowRightCircle,
  Award, ThumbsUp, Copy, Check, Package,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { translateHotelName, translateHotelAddress } from "@/lib/translations";
import AirportGuide from "./AirportGuide";
import airportRoutesData from "../../public/data/airport-routes.json";
import reputationData from "../../public/data/reputation.json";
import { buildAffiliateUrl, getAffiliateProviderName } from "@/lib/affiliate";

interface HotelImageCardProps {
  imageUrl?: string;
  hotelName: string;
  rating: string;
  city: string;
  isLuxury: boolean;
  isBudget: boolean;
  lang: string;
  rep?: any;
}

function HotelImageCard({
  imageUrl,
  hotelName,
  rating,
  city,
  isLuxury,
  isBudget,
  lang,
  rep,
}: HotelImageCardProps) {
  const t = useTranslations("hotels");
  const [loaded, setLoaded] = useState(false);
  const stars = parseInt(rating);

  const isInvalidSource = imageUrl?.includes("source.unsplash.com");
  const src = imageUrl && imageUrl.startsWith("http") && !isInvalidSource ? imageUrl : null;

  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden flex items-center justify-center">
      {!src && (
        <div className="text-center mt-3">
          <span className="text-4xl mb-1 block drop-shadow-sm">🏨</span>
          <span className="text-[11px] font-bold text-purple-400">{t("imagePreparing")}</span>
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
            className={`object-cover transition-opacity duration-700 ${loaded ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setLoaded(true)}
          />
        </>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {rep && rep.originalRating > 0 && (
        <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md">
          <span className="text-yellow-500 text-xs">★</span>
          <span className="text-gray-800 text-xs font-bold">{rep.originalRating.toFixed(1)}</span>
          <span className="text-gray-500 text-[10px]">({rep.reviewCount.toLocaleString()})</span>
        </div>
      )}
      <div className="absolute top-2 right-2 pointer-events-none">
        {isLuxury && (
          <span className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-[9px] px-2 py-0.5 rounded-full font-extrabold shadow-md">
            ★ {stars} {t("premiumBadge")}
          </span>
        )}
        {isBudget && (
          <span className="bg-rose-500 text-white text-[9px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
            {stars} {t("budgetBadge")}
          </span>
        )}
        {!isLuxury && !isBudget && (
          <span className="bg-indigo-500/80 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
            ★ {stars} {t("starBadge")}
          </span>
        )}
      </div>
    </div>
  );
}

interface HotelSectionProps {
  hotelsList: any[];
  activeRating: string | null;
  extractTheme: (titleData: any) => { label: string; color: string } | null;
  getPromoTitle: (titleObj: any) => string;
  sectionTitle?: string;
}

export default function HotelSection({
  hotelsList,
  activeRating,
  extractTheme,
  getPromoTitle,
  sectionTitle,
}: HotelSectionProps) {
  const t = useTranslations("hotels");
  const tSections = useTranslations("sections");
  const locale = useLocale();
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleGuide = (hotelName: string) => {
    setExpandedHotel(expandedHotel === hotelName ? null : hotelName);
  };

  const copyAddress = (hotel: any) => {
    const koreanAddr = hotel.주소 || hotel.address || hotel.tourApiAddress || "";
    // 택시 기사용 주소는 한국어 원본 유지 (택시 기사가 한국어로 읽음)
    const text = `[${hotel.이름}] ${koreanAddr}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(hotel.이름);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

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
          ⭐ {sectionTitle || t("fullPromotionsTitle", { count: hotelsList.length })}
          <span className="text-indigo-600 font-extrabold bg-indigo-100/50 px-2.5 py-0.5 rounded-md shadow-inner text-sm">
            {hotelsList.length}
          </span>
          <span className="text-xs font-normal text-gray-500">{t("results")}</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {sortedHotels.length > 0 ? (
          sortedHotels.map((hotel: any, index: number) => {
            const hRating = hotel.rating || activeRating || "3성";
            const isLuxury = hRating === "5성";
            const isBudget = hRating === "3성";
            const rep = (reputationData as any)[hotel.이름] || { originalRating: 0, reviewCount: 0 };
            const hasPromo = hotel.promotions && hotel.promotions.length > 0;
            const isTopRanked = index === 0 && !hasPromo;
            const koreanAddr = hotel.주소 || hotel.address || hotel.tourApiAddress || "";

            const affiliateUrl = buildAffiliateUrl(hotel.이름, locale);
            const providerName = getAffiliateProviderName(locale);

            return (
              <div
                key={index}
                id={`hotel-${index}`}
                className={`bg-white rounded-2xl border flex flex-col transition-all hover:-translate-y-1 duration-200 group relative overflow-hidden ${
                  isLuxury
                    ? "shadow-lg shadow-yellow-500/10 border-yellow-300 ring-1 ring-yellow-100"
                    : "shadow-sm border-gray-200"
                }`}
              >
                <HotelImageCard
                  imageUrl={hotel.imageUrl}
                  hotelName={hotel.이름}
                  rating={hRating}
                  city={hotel.시도}
                  isLuxury={isLuxury}
                  isBudget={isBudget}
                  lang={locale}
                  rep={rep}
                />

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {isTopRanked && (
                          <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 w-fit px-2 py-0.5 rounded-md border border-emerald-100">
                            <Award size={12} className="text-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-tight">
                              {t("pick")}
                            </span>
                          </div>
                        )}
                        {hotel.zimcarry_registered && (
                          <div
                            className="flex items-center gap-1 bg-emerald-50 text-emerald-600 w-fit px-1.5 py-0.5 rounded-md border border-emerald-100"
                            title={`Baggage Delivery (Deadline: ${hotel.zimcarry_deadline})`}
                          >
                            <Package size={10} className="text-emerald-500" />
                            <span className="text-[9px] font-bold">{t("baggageService")}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3
                          className={`text-[15px] font-bold leading-snug break-words min-w-0 group-hover:opacity-80 transition-colors ${
                            isLuxury ? "text-yellow-800" : "text-gray-900"
                          }`}
                        >
                          {translateHotelName(hotel["이름"], locale)}
                        </h3>
                      </div>

                      {/* 위치 정보 통합 묶음 (⑦+⑧+⑨) */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        {/* ⑦ 주소 */}
                        <div className="flex items-center gap-2 text-[11px] text-gray-600">
                          <MapPin size={12} className="text-gray-400 shrink-0" />
                          <span className="line-clamp-1">{koreanAddr}</span>
                        </div>
                        
                        {/* ⑧ 전화번호 */}
                        {hotel.전화번호 && (
                          <div className="flex items-center gap-2 text-[11px] text-gray-600">
                            <Phone size={12} className="text-gray-400 shrink-0" />
                            <a href={`tel:${hotel.전화번호}`} className="hover:underline">
                              {hotel.전화번호}
                            </a>
                          </div>
                        )}
                        
                        {/* ⑨ Copy for Taxi 버튼 */}
                        {koreanAddr && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              copyAddress(hotel);
                            }}
                            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 self-start transition-colors"
                          >
                            {copiedId === hotel.이름 ? <Check size={12} /> : <Copy size={12} />}
                            <span>{t("copyAddress")}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-2 pt-3 border-t border-gray-100/80 border-dashed">


                    {hasPromo && (
                      <div className="mt-1 flex flex-col gap-2">
                        <span className="text-[10px] font-extrabold text-rose-500 flex items-center gap-1 bg-rose-50 w-fit px-2 py-0.5 rounded-full">
                          🔥 {t("activePromotion")}
                        </span>
                        {hotel.promotions.map((promo: any, idx: number) => {
                          const displayTitle = getPromoTitle(promo.title);
                          const theme = extractTheme(promo.title);

                          return (
                            <a
                              href={promo.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              key={idx}
                              className="flex gap-2 bg-gray-50 rounded-xl p-1.5 hover:bg-white transition-all border border-gray-200 shadow-sm relative overflow-hidden"
                            >
                              {promo.imageUrl && (
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200 ring-1 ring-black/5">
                                  <Image
                                    src={promo.imageUrl}
                                    alt={displayTitle}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                  />
                                </div>
                              )}
                              <div className="flex flex-col justify-center flex-1">
                                {theme && (
                                  <span
                                    className={`text-[8px] px-1.5 py-0.5 mb-1 rounded-sm w-fit font-bold border ${theme.color}`}
                                  >
                                    {theme.label}
                                  </span>
                                )}
                                <span className="text-[11px] font-bold text-gray-800 line-clamp-2 leading-tight">
                                  {displayTitle}
                                </span>
                                <span className="text-[9px] text-gray-500 mt-0.5 font-medium">{promo.period}</span>
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between px-1 mb-1">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {t("lowestPrice")}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">{providerName}</span>
                        </div>

                        <a
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative flex items-center justify-between w-full bg-gradient-to-r from-[#003580] to-[#0051ba] p-3 rounded-xl shadow-lg shadow-blue-900/10 hover:scale-[1.02] transition-all group overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <div className="flex flex-col items-start z-10">
                            <span className="text-[10px] text-blue-200 font-medium mb-0.5">
                              {providerName} · {t("realtimeLinked")}
                            </span>
                            <span className="text-[13px] font-extrabold text-white flex items-center gap-1.5">
                              <CalendarDays size={14} className="text-yellow-400" />
                              {t("checkLowestPrice")}
                            </span>
                          </div>
                          <div className="bg-yellow-400 text-[#003580] px-3 py-1.5 rounded-lg text-[12px] font-black shadow-sm group-hover:bg-white transition-colors z-10">
                            GO &gt;
                          </div>
                        </a>

                        <div className="flex gap-2 mt-1">
                          <a
                            href={hotel.홈페이지 || hotel.official_link || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-1.5 flex-1 bg-white border border-gray-200 py-2 rounded-lg text-[11px] font-bold text-gray-500 hover:bg-gray-50 transition-all"
                          >
                            <Globe size={12} className="text-gray-400" /> {t("officialSite")}
                          </a>
                          <button
                            onClick={() => toggleGuide(hotel.이름)}
                            className={`flex items-center justify-center gap-1.5 flex-1 py-2 rounded-lg text-[11px] font-bold transition-all border ${
                              expandedHotel === hotel.이름
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100"
                            }`}
                          >
                            <ArrowRightCircle
                              size={12}
                              className={expandedHotel === hotel.이름 ? "text-blue-200" : "text-blue-400"}
                            />
                            {t("airportGuide")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {expandedHotel === hotel.이름 && (
                  <div className="px-4 pb-4 animate-in slide-in-from-top-1 duration-300">
                    <AirportGuide
                      hotelName={translateHotelName(hotel.이름, locale)}
                      lang={locale}
                      routeData={(airportRoutesData as any)[hotel.이름]}
                      isZimCarryRegistered={hotel.zimcarry_registered}
                      zimCarryDeadline={hotel.zimcarry_deadline}
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
            <p className="font-bold text-gray-800 text-sm">{t("emptyTitle")}</p>
            <p className="text-xs mt-1 text-gray-500 font-medium">{t("emptySubtitle")}</p>
          </div>
        )}
      </div>
    </section>
  );
}
