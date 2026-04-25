// src/lib/affiliate.ts
// 호텔 OTA 제휴 링크 생성: locale 기반 분기
// - ko → Agoda (한국 시장 인지도·전환율 우위)
// - 외 → Booking.com (글로벌 표준)

export function buildAffiliateUrl(hotelName: string, locale: string): string {
  const encoded = encodeURIComponent(hotelName);

  if (locale === "ko") {
    const aid = process.env.NEXT_PUBLIC_AGODA_AID || "";
    const aidParam = aid ? `&cid=${aid}` : "";
    return `https://www.agoda.com/ko-kr/search?query=${encoded}${aidParam}`;
  }

  const aid = process.env.NEXT_PUBLIC_BOOKING_AID || "";
  const aidParam = aid ? `&aid=${aid}` : "";
  return `https://www.booking.com/searchresults.html?ss=${encoded}${aidParam}`;
}

export function getAffiliateProviderName(locale: string): string {
  return locale === "ko" ? "Agoda" : "Booking.com";
}
