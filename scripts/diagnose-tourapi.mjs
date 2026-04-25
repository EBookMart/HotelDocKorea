// scripts/diagnose-tourapi.mjs
// TourAPI 응답을 원본 그대로 출력하여 문제를 진단합니다.

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

async function tryEndpoint(label, url) {
  console.log(`\n========== ${label} ==========`);
  console.log(`URL: ${url.replace(/serviceKey=[^&]+/, "serviceKey=***MASKED***")}`);
  try {
    const res = await fetch(url);
    console.log(`HTTP Status: ${res.status}`);
    const contentType = res.headers.get("content-type") || "";
    console.log(`Content-Type: ${contentType}`);
    const text = await res.text();
    console.log(`Response (first 2000 chars):`);
    console.log(text.slice(0, 2000));
    if (text.length > 2000) {
      console.log(`... (truncated, total ${text.length} chars)`);
    }
  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function main() {
  await loadEnv();
  const apiKey = process.env.TOUR_API_KEY;
  if (!apiKey) {
    console.error("TOUR_API_KEY not set in .env");
    process.exit(1);
  }

  const common = `serviceKey=${encodeURIComponent(apiKey)}&MobileOS=ETC&MobileApp=HotelDocKorea&_type=json&numOfRows=10&pageNo=1`;

  // 서울(areaCode=1), 오늘부터 60일까지 축제 조회
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const startDate = `${yyyy}${mm}${dd}`;

  // 후보 엔드포인트 3종 모두 시도
  await tryEndpoint(
    "KorService2 / searchFestival2 (current attempt)",
    `https://apis.data.go.kr/B551011/KorService2/searchFestival2?${common}&arrange=A&eventStartDate=${startDate}&areaCode=1`
  );

  await tryEndpoint(
    "KorService1 / searchFestival1",
    `https://apis.data.go.kr/B551011/KorService1/searchFestival1?${common}&arrange=A&eventStartDate=${startDate}&areaCode=1`
  );

  await tryEndpoint(
    "KorService (no suffix) / searchFestival",
    `https://apis.data.go.kr/B551011/KorService/searchFestival?${common}&arrange=A&eventStartDate=${startDate}&areaCode=1`
  );

  // 전국 조회 (areaCode 제거)
  await tryEndpoint(
    "KorService2 / searchFestival2 / all regions",
    `https://apis.data.go.kr/B551011/KorService2/searchFestival2?${common}&arrange=A&eventStartDate=${startDate}`
  );
}

main();
