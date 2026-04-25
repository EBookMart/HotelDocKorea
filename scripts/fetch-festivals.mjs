// scripts/fetch-festivals.mjs
// 한국관광공사 TourAPI 4.0 (KorService2)에서 축제 데이터를 빌드 타임에 수집합니다.
// 실행: npm run build 시 prebuild 훅으로 자동 실행 / 수동: npm run festivals:refresh

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

async function loadEnv() {
  for (const fileName of [".env.local", ".env"]) {
    try {
      const raw = await fs.readFile(path.join(projectRoot, fileName), "utf8");
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eq = trimmed.indexOf("=");
        if (eq === -1) continue;
        const key = trimmed.slice(0, eq).trim();
        let value = trimmed.slice(eq + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key]) process.env[key] = value;
      }
    } catch {}
  }
}

// 법정동 시도 코드(lDongRegnCd) → HotelDocKorea 7개 권역
// 출처: 행정안전부 법정동 표준코드 (2자리 시도)
const LDONG_TO_REGION = {
  "11": "수도권",      // 서울특별시
  "26": "부산경남권",  // 부산광역시
  "27": "대구경북권",  // 대구광역시
  "28": "수도권",      // 인천광역시
  "29": "광주호남권",  // 광주광역시
  "30": "충청권",      // 대전광역시
  "31": "부산경남권",  // 울산광역시
  "36": "충청권",      // 세종특별자치시
  "41": "수도권",      // 경기도
  "43": "충청권",      // 충청북도
  "44": "충청권",      // 충청남도
  "46": "광주호남권",  // 전라남도
  "47": "대구경북권",  // 경상북도
  "48": "부산경남권",  // 경상남도
  "50": "제주도",      // 제주특별자치도
  "51": "영동권",      // 강원특별자치도
  "52": "광주호남권",  // 전북특별자치도
};

const ICON_RULES = [
  { keywords: ["벚꽃", "봄꽃", "꽃축제", "유채", "철쭉", "장미", "튤립"], icon: "🌸" },
  { keywords: ["불꽃", "불빛축제", "축포", "폭죽"], icon: "🎆" },
  { keywords: ["단풍", "가을"], icon: "🍁" },
  { keywords: ["얼음", "눈꽃", "빙어", "눈축제", "스키", "겨울"], icon: "❄️" },
  { keywords: ["바다", "해변", "갯벌", "머드", "해수욕"], icon: "🏖️" },
  { keywords: ["드론", "라이트쇼", "등축제", "연등", "루미나리에", "야경"], icon: "✨" },
  { keywords: ["음식", "먹거리", "한우", "김치", "막걸리", "전통주", "고등어", "전복", "대게", "게장", "복숭아", "수박", "포도"], icon: "🍲" },
  { keywords: ["차축제", "녹차", "커피"], icon: "🍵" },
  { keywords: ["영화제", "필름", "영상"], icon: "🎬" },
  { keywords: ["재즈", "음악", "콘서트", "록페", "페스티벌", "뮤직"], icon: "🎵" },
  { keywords: ["부처", "봉축"], icon: "🪷" },
  { keywords: ["군항", "군악", "항구"], icon: "⚓" },
  { keywords: ["마라톤", "달리기", "트레일", "레이스"], icon: "🏃" },
  { keywords: ["한복", "전통", "민속", "문화제"], icon: "🎎" },
  { keywords: ["도자기", "도예", "공예"], icon: "🏺" },
  { keywords: ["나비", "반딧불"], icon: "🦋" },
  { keywords: ["단오"], icon: "🎋" },
];

function assignIcon(title) {
  for (const rule of ICON_RULES) {
    if (rule.keywords.some((kw) => title.includes(kw))) return rule.icon;
  }
  return "🎪";
}

function formatDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "";
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function formatPeriod(start, end) {
  const s = start ? `${start.slice(0, 4)}.${start.slice(4, 6)}.${start.slice(6, 8)}` : "";
  const e = end ? `${end.slice(0, 4)}.${end.slice(4, 6)}.${end.slice(6, 8)}` : "";
  if (!s) return e;
  if (!e) return s;
  return `${s} - ${e}`;
}

async function fetchPage(apiKey, eventStartDate, pageNo) {
  const params = new URLSearchParams({
    serviceKey: apiKey,
    MobileOS: "ETC",
    MobileApp: "HotelDocKorea",
    _type: "json",
    arrange: "A",
    eventStartDate,
    numOfRows: "100",
    pageNo: String(pageNo),
  });
  const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} on page ${pageNo}`);
  const data = await res.json();
  const body = data?.response?.body;
  if (!body) return { items: [], totalCount: 0 };
  const items = body.items?.item;
  const arr = !items ? [] : Array.isArray(items) ? items : [items];
  return { items: arr, totalCount: body.totalCount ?? 0 };
}

async function main() {
  await loadEnv();
  const apiKey = process.env.TOUR_API_KEY;
  if (!apiKey) {
    console.warn("[fetch-festivals] TOUR_API_KEY not set. Skipping, existing festivals.json preserved.");
    return;
  }

  const today = new Date();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const eventStartDate =
    sevenDaysAgo.getFullYear().toString() +
    String(sevenDaysAgo.getMonth() + 1).padStart(2, "0") +
    String(sevenDaysAgo.getDate()).padStart(2, "0");

  const sixtyDaysLater = new Date(today);
  sixtyDaysLater.setDate(sixtyDaysLater.getDate() + 60);
  const cutoffDate = sixtyDaysLater.toISOString().split("T")[0];
  const todayDate = today.toISOString().split("T")[0];

  console.log(`[fetch-festivals] Fetching festivals from TourAPI (start ${eventStartDate}, cutoff ${cutoffDate})`);

  // 전국 조회 후 응답 내 lDongRegnCd로 권역 분류
  const allRaw = [];
  let page = 1;
  let totalCount = 0;
  const MAX_PAGES = 20; // 안전 상한 (100 × 20 = 최대 2000건)

  while (page <= MAX_PAGES) {
    try {
      const { items, totalCount: tc } = await fetchPage(apiKey, eventStartDate, page);
      if (page === 1) totalCount = tc;
      if (items.length === 0) break;
      allRaw.push(...items);
      if (allRaw.length >= totalCount) break;
      page++;
    } catch (err) {
      console.warn(`[fetch-festivals] Page ${page} failed: ${err.message}`);
      break;
    }
  }

  console.log(`[fetch-festivals] Received ${allRaw.length} raw items (API totalCount: ${totalCount})`);

  const festivals = [];
  let skippedPast = 0;
  let skippedFuture = 0;
  let skippedNoRegion = 0;

  for (const item of allRaw) {
    const startDate = formatDate(item.eventstartdate);
    const endDate = formatDate(item.eventenddate);

    if (endDate && endDate < todayDate) {
      skippedPast++;
      continue;
    }
    if (startDate && startDate > cutoffDate) {
      skippedFuture++;
      continue;
    }

    const ldongRegnCd = String(item.lDongRegnCd || "").padStart(2, "0");
    const region = LDONG_TO_REGION[ldongRegnCd];
    if (!region) {
      skippedNoRegion++;
      continue;
    }

    const name = (item.title || "").trim();
    if (!name) continue;

    festivals.push({
      id: `fest-${item.contentid}`,
      icon: assignIcon(name),
      name,
      period: formatPeriod(item.eventstartdate, item.eventenddate),
      location: (item.addr1 || "").trim(),
      description: "",
      region,
      active: true,
      startDate,
      endDate,
    });
  }

  // 중복 제거 + 시작일 오름차순
  const unique = new Map();
  for (const f of festivals) {
    if (!unique.has(f.id)) unique.set(f.id, f);
  }
  const sorted = [...unique.values()].sort((a, b) =>
    (a.startDate || "").localeCompare(b.startDate || "")
  );

  console.log(`[fetch-festivals] Filter result: ${sorted.length} kept (past: ${skippedPast}, far future: ${skippedFuture}, no region: ${skippedNoRegion})`);

  const outPath = path.join(projectRoot, "public", "data", "festivals.json");
  const payload = {
    _generatedAt: new Date().toISOString(),
    _source: "TourAPI 4.0 / KorService2 / searchFestival2",
    _apiTotalCount: totalCount,
    festivals: sorted,
  };

  await fs.writeFile(outPath, JSON.stringify(payload, null, 2), "utf8");
  console.log(`[fetch-festivals] Saved ${sorted.length} festivals to ${outPath}`);
}

main().catch((err) => {
  console.error("[fetch-festivals] Unexpected error:", err);
  console.warn("[fetch-festivals] Existing festivals.json preserved.");
  process.exit(0);
});
