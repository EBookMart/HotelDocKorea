"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

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

export default function HotPicksSection({
  selectedRegion,
  selectedGrade,
  fallbackHotels,
}: {
  selectedRegion: string | null;
  selectedGrade: number | null;
  fallbackHotels: Hotel[];
}) {
  const [promos, setPromos] = useState<HotPickData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/hot-picks.json")
      .then((res) => res.json())
      .then((data) => {
        setPromos(data.promotions || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("HOT 프로모션 데이터를 불러오지 못했습니다:", err);
        setLoading(false);
      });
  }, []);

  const today = new Date().toISOString().split("T")[0];

  // 1단계: 유효한 프로모션 필터링 및 데이터 매칭 (이름 기준으로 hotels.json과 연결)
  const activePromos: HotPickItem[] = promos
    .filter((p) => {
      // 활성화 여부 및 기간 확인
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
        region: matched?.region || matched?.시도 || "전국",
        grade: matched?.grade || parseInt(matched?.rating || "3"),
        imageUrl: matched?.imageUrl,
        isPromo: true,
      };
    })
    .filter((p) => !!p.imageUrl); // [추가] 이미지 URL이 있는 호텔만 표시

  // 2단계: 사용자가 선택한 필터(지역/등급) 적용
  let displayedItems = activePromos.filter((p) => {
    if (selectedRegion && p.region !== selectedRegion) return false;
    if (selectedGrade && p.grade !== selectedGrade) return false;
    return true;
  });

  const hasPromos = displayedItems.length > 0;

  // 3단계: 노출할 항목이 4개 미만인 경우 Fallback (이미지 확보된 5성급 호텔 자동 선별)
  if (displayedItems.length < 4) {
    const extraHotels = fallbackHotels
      .filter((h) => {
        const grade = h.grade || parseInt(h.rating || "0");
        const region = h.region || h.시도 || "";
        const hasImage = !!h.imageUrl;
        
        // 기본 필터 조건 (지역/등급) 확인
        if (selectedRegion && region !== selectedRegion) return false;
        if (selectedGrade && grade !== selectedGrade) return false;
        
        // Fallback 기준: 5성급 우선 + 이미지 필수
        if (grade !== 5 || !hasImage) return false;
        
        // 이미 중복된 호텔 제외
        const hotelName = h.이름 || h.name || h.hotelName;
        if (displayedItems.some(item => item.hotelName === hotelName)) return false;
        
        return true;
      })
      .slice(0, 4 - displayedItems.length)
      .map((h) => ({
        hotelName: h.이름 || h.name || h.hotelName || "호텔명 미상",
        promoTitle: h.주소 || h.address || "엄선된 프리미엄 호텔",
        discount: "인기 추천",
        region: h.region || h.시도 || "전국",
        grade: h.grade || parseInt(h.rating || "3"),
        imageUrl: h.imageUrl,
        isPromo: false,
      }));
      
    displayedItems = [...displayedItems, ...extraHotels];
  }

  // 최종 4개만 표시
  const finalDisplay = displayedItems.slice(0, 4);

  // 섹션 제목 및 디자인 토큰 구성
  const regionLabel = selectedRegion ?? "전국";
  const gradeLabel = selectedGrade ? `${selectedGrade}성` : "";
  const sectionTitle = hasPromos
    ? `${regionLabel} HOT 프로모션`
    : `${regionLabel} ${gradeLabel} 추천 호텔`.trim();

  const badgeLabel = hasPromos ? "EDITOR'S PICK" : "STAY PICK";
  const sectionIcon = hasPromos ? "🔥" : "✨";

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-10">
        <div className="max-w-7xl mx-auto px-4 animate-pulse">
          <div className="h-8 w-64 bg-purple-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-xl h-72 shadow-sm"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (finalDisplay.length === 0) {
    return (
      <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center py-16">
          <div className="text-5xl mb-4 opacity-50">🏝️</div>
          <h2 className="text-2xl font-bold text-purple-900/40 mb-2">{sectionTitle}</h2>
          <p className="text-purple-900/30">해당 조건에 맞는 프로모션을 준비 중입니다.</p>
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
          <span className={`text-[10px] font-black px-2 py-1 rounded-full tracking-tighter ${
            hasPromos ? 'bg-amber-400 text-amber-900 shadow-sm' : 'bg-white text-purple-400 border border-purple-100'
          }`}>
            {badgeLabel}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {finalDisplay.map((item, i) => (
            <div key={i} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-purple-100 flex flex-col h-full active:scale-[0.98]">
              {/* 이미지 영역 */}
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
                    <span className="text-[10px] font-bold">IMAGE PREPARING</span>
                  </div>
                )}
                {/* 오버레이 라이트 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
              </div>

              {/* 컨텐츠 영역 */}
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-center gap-1 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} className={`text-[10px] ${j < item.grade ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="ml-auto text-[10px] font-bold text-purple-400 bg-purple-50 px-1.5 py-0.5 rounded">
                    {item.region}
                  </span>
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1 group-hover:text-purple-700 transition-colors">
                  {item.hotelName}
                </h3>
                
                <p className="text-xs text-gray-500 mb-4 line-clamp-2 leading-snug min-h-[32px]">
                  {item.promoTitle}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  <div className={`text-xs font-black px-2 py-1 rounded ${
                    item.isPromo ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400'
                  }`}>
                    {item.discount}
                  </div>
                  <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-0.5">
                    VIEW DETAIL <span className="text-xs">→</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
