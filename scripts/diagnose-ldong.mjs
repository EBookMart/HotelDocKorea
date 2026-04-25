// scripts/diagnose-ldong.mjs
// TourAPI 응답의 첫 5개 아이템에서 lDong 필드가 실제로 어떻게 표기되는지 확인

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

await loadEnv();
const apiKey = process.env.TOUR_API_KEY;

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, "0");
const dd = String(today.getDate()).padStart(2, "0");
const startDate = `${yyyy}${mm}${dd}`;

const params = new URLSearchParams({
  serviceKey: apiKey,
  MobileOS: "ETC",
  MobileApp: "HotelDocKorea",
  _type: "json",
  arrange: "A",
  eventStartDate: startDate,
  numOfRows: "5",
  pageNo: "1",
});

const url = `https://apis.data.go.kr/B551011/KorService2/searchFestival2?${params.toString()}`;
const res = await fetch(url);
const data = await res.json();
const items = data?.response?.body?.items?.item || [];

console.log(`\n샘플 5개 축제의 필드 목록과 값:\n`);
for (const item of items) {
  console.log(`========= ${item.title} =========`);
  console.log(`주소: ${item.addr1}`);
  const allKeys = Object.keys(item).sort();
  const ldongKeys = allKeys.filter((k) => k.toLowerCase().includes("dong") || k.toLowerCase().includes("area") || k.toLowerCase().includes("regn") || k.toLowerCase().includes("signgu"));
  for (const key of ldongKeys) {
    console.log(`  ${key}: "${item[key]}"`);
  }
  console.log("");
}
