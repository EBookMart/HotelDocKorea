export type Language = "ko" | "en" | "ja" | "zh" | "es";

export const LANGUAGES = [
  { code: "ko", shortLabel: "한국어",  flag: "🇰🇷" },
  { code: "en", shortLabel: "English", flag: "🇺🇸" },
  { code: "ja", shortLabel: "日本語",   flag: "🇯🇵" },
  { code: "zh", shortLabel: "中文",     flag: "🇨🇳" },
  { code: "es", shortLabel: "Español",  flag: "🇪🇸" },
];

export const translations = {
  ko: {
    brandName: "HotelDocKorea",
    subtitle: "떠나기 전, 가장 먼저 열어보는 호텔 리조트 가이드",
    metaDescription:
      "한국 3성급 이상 호텔·리조트 520여 곳의 실시간 프로모션, 주변 축제와 맛집, 기상정보까지 — 여행의 모든 정보를 한 곳에서",
    regions: {
      capital:   "수도권",
      yeongdong: "영동권",
      busan:     "부산경남권",
      daegu:     "대구경북권",
      honam:     "광주호남권",
      chungcheong: "충청권",
      jeju:      "제주도",
    },
    sections: {
      hotels:    "호텔 · 리조트 프로모션",
      festivals: "축제 · 공연 · 행사",
      nearby:    "주변 맛집 · 관광지",
      weather:   "권역별 기상정보",
      weatherToday: "🌤️ 오늘의 날씨",
      weatherWeekly: "📅 주간 날씨",
    },
  },
  en: {
    brandName: "HotelDocKorea",
    subtitle: "Your trusted doc for Korea's best hotel deals",
    metaDescription:
      "Real-time promotions from 520+ premium hotels and resorts in Korea, plus local festivals, restaurants, and weather — all in one place.",
    regions: {
      capital:     "Seoul & Capital Area",
      yeongdong:   "East Coast",
      busan:       "Busan & Gyeongnam",
      daegu:       "Daegu & Gyeongbuk",
      honam:       "Gwangju & Honam",
      chungcheong: "Chungcheong",
      jeju:        "Jeju Island",
    },
    sections: {
      hotels:    "Hotels & Resorts",
      festivals: "Festivals & Events",
      nearby:    "Nearby Food & Attractions",
      weather:   "Regional Weather",
      weatherToday: "🌤️ Today's Weather",
      weatherWeekly: "📅 Weekly Weather",
    },
  },
  ja: {
    brandName: "HotelDocKorea",
    subtitle: "旅立つ前に、まず開くホテルガイド",
    metaDescription:
      "韓国の3つ星以上のホテル・リゾート520ヶ所の最新プロモーション、周辺のお祭り、グルメ、気象情報まで — 旅のすべてを一箇所に。",
    regions: {
      capital:     "首都圏",
      yeongdong:   "嶺東圏",
      busan:       "釜山慶南圏",
      daegu:       "大邱慶北圏",
      honam:       "光州湖南圏",
      chungcheong: "忠清圏",
      jeju:        "済州島",
    },
    sections: {
      hotels:    "ホテル・リゾートプロモーション",
      festivals: "お祭り・イベント",
      nearby:    "周辺のグルメ・観光地",
      weather:   "地域別気상情報",
      weatherToday: "🌤️ 今日の天気",
      weatherWeekly: "📅 週間天気",
    },
  },
  zh: {
    brandName: "HotelDocKorea",
    subtitle: "出发前，最先打开的韩国酒店指南",
    metaDescription:
      "韩国3星级以上520余家酒店·度假村的实时促销、周边庆典、美食、天气信息 — 旅行所需一站尽览。",
    regions: {
      capital:     "首都圈",
      yeongdong:   "岭东圈",
      busan:       "釜山庆南圈",
      daegu:       "大邱庆北圈",
      honam:       "光州湖南圈",
      chungcheong: "忠清圈",
      jeju:        "济州岛",
    },
    sections: {
      hotels:    "酒店 · 度假村促销",
      festivals: "庆典 · 活动",
      nearby:    "周边美食 · 景点",
      weather:   "区域气象信息",
      weatherToday: "🌤️ 今日天气",
      weatherWeekly: "📅 本周天气",
    },
  },
  es: {
    brandName: "HotelDocKorea",
    subtitle: "Tu guía de hoteles coreanos, antes de partir",
    metaDescription:
      "Promociones en tiempo real de más de 520 hoteles y resorts premium en Corea, festivales locales, restaurantes y clima — todo en un solo lugar.",
    regions: {
      capital:     "Área de Seúl",
      yeongdong:   "Costa Este",
      busan:       "Busan y Gyeongnam",
      daegu:       "Daegu y Gyeongbuk",
      honam:       "Gwangju y Honam",
      chungcheong: "Chungcheong",
      jeju:        "Isla de Jeju",
    },
    sections: {
      hotels:    "Hoteles y Resorts",
      festivals: "Festivales y Eventos",
      nearby:    "Comida y Atracciones Cercanas",
      weather:   "Clima Regional",
      weatherToday: "🌤️ El tiempo de hoy",
      weatherWeekly: "📅 El tiempo de la semana",
    },
  },
};

export type TranslationKey = keyof typeof translations.ko;
