"use client";

interface HotPick {
  hotelName: string;
  region: string;
  grade: number;
  promoTitle: string;
  discount: string;
  ctaUrl: string;
}

interface Hotel {
  [key: string]: any;
}

const SAMPLE_HOT_PICKS: HotPick[] = [
  { hotelName: "시그니엘 서울",      region: "수도권",     grade: 5, promoTitle: "봄 시즌 이그제큐티브 패키지",   discount: "최대 35%",  ctaUrl: "#" },
  { hotelName: "파라다이스시티",     region: "수도권",     grade: 5, promoTitle: "얼리버드 15% + 조식 2인 무료",   discount: "25% + 혜택", ctaUrl: "#" },
  { hotelName: "롯데호텔 제주",      region: "제주도",     grade: 5, promoTitle: "패밀리 풀빌라 특가",              discount: "40%",        ctaUrl: "#" },
  { hotelName: "그랜드 조선 부산",   region: "부산경남권", grade: 5, promoTitle: "오션뷰 스위트 + 디너",           discount: "30%",        ctaUrl: "#" },
  { hotelName: "라까사 호텔 서울",   region: "수도권",     grade: 4, promoTitle: "주중 스테이 + 룸서비스",         discount: "20%",        ctaUrl: "#" },
];

export default function HotPicksSection({
  selectedRegion,
  selectedGrade,
  fallbackHotels,
}: {
  selectedRegion: string | null;
  selectedGrade: number | null;
  fallbackHotels: Hotel[];
}) {
  // 1단계: 필터에 맞는 프로모션 찾기
  const matchingPromos = SAMPLE_HOT_PICKS.filter((p) => {
    if (selectedRegion && p.region !== selectedRegion) return false;
    if (selectedGrade && p.grade !== selectedGrade) return false;
    return true;
  });

  // 2단계: 프로모션이 있으면 프로모션, 없으면 fallback 호텔 사용
  const hasPromos = matchingPromos.length > 0;
  const displayItems = hasPromos
    ? matchingPromos.slice(0, 4)
    : fallbackHotels.slice(0, 4);

  // 섹션 제목 구성
  const regionLabel = selectedRegion ?? "전국";
  const gradeLabel = selectedGrade ? `${selectedGrade}성` : "";
  const sectionTitle = hasPromos
    ? `${regionLabel} HOT 프로모션`
    : `${regionLabel} ${gradeLabel} 추천 호텔`.trim();

  const badgeLabel = hasPromos ? "EDITOR'S PICK" : "추천";
  const sectionIcon = hasPromos ? "⭐" : "✨";

  // 빈 상태 처리 (필터 결과도 없고 fallback 호텔도 없는 경우)
  if (displayItems.length === 0) {
    return (
      <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-10">
        <div className="max-w-7xl mx-auto px-4 text-center py-10">
          <div className="text-4xl mb-4">{sectionIcon}</div>
          <h2 className="text-xl font-bold text-gray-500 mb-2">{sectionTitle}</h2>
          <p className="text-sm text-gray-400">해당 조건의 호텔이 없습니다. 다른 권역·등급을 선택해 보세요.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">{sectionIcon}</span>
          <h2 className="text-2xl font-bold text-purple-900">{sectionTitle}</h2>
          <span className={`text-xs font-bold px-2 py-1 rounded ml-2 ${hasPromos ? 'bg-amber-400 text-amber-900' : 'bg-gray-200 text-gray-600'}`}>
            {badgeLabel}
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {displayItems.map((item: any, i: number) => {
            const name = hasPromos ? item.hotelName : (item.이름 || item.name || item.hotelName || "호텔명 미상");
            const region = item.region || item.시도 || selectedRegion || "";
            const grade = item.grade ? item.grade : parseInt(item.rating || "3");
            const promoTitle = hasPromos ? item.promoTitle : null;
            const discount = hasPromos ? item.discount : null;
            const address = !hasPromos ? (item.주소 || item.address || "") : null;

            return (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer border border-purple-100 flex flex-col h-full">
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl block mb-1">🏨</span>
                    <span className="text-xs text-purple-400">이미지 준비 중</span>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {Array.from({ length: grade || 3 }).map((_, j) => (
                      <span key={j} className="text-amber-400 text-sm">★</span>
                    ))}
                    <span className="ml-auto text-xs text-gray-500">{region}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 truncate">{name}</h3>
                  
                  {hasPromos ? (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{promoTitle}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{address}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto">
                    {hasPromos ? (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {discount}
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">
                        프로모션 준비 중
                      </span>
                    )}
                    <span className="text-xs text-purple-600 font-semibold">
                      {hasPromos ? "자세히 →" : "호텔 정보 →"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
