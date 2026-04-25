// scripts/test-deepl.mjs
// Phase 2B-3 진단: DeepL API 연동 및 번역 품질 검증
// 호텔 5개의 이름·주소만 번역하여 결과를 콘솔에 출력합니다. 파일 저장 없음.
// 실행: node scripts/test-deepl.mjs

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

const TARGET_LANGS = [
  { code: "EN-US", label: "en" },
  { code: "JA", label: "ja" },
  { code: "ZH", label: "zh" },
  { code: "ES", label: "es" },
];

async function translateBatch(apiKey, texts, targetLang) {
  const isFreeKey = apiKey.endsWith(":fx");
  const endpoint = isFreeKey
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const params = new URLSearchParams();
  // auth_key를 본문에서 제거하고 Authorization 헤더를 사용합니다.
  params.append("source_lang", "KO");
  params.append("target_lang", targetLang);
  for (const text of texts) {
    params.append("text", text);
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `DeepL-Auth-Key ${apiKey}`
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 500)}`);
  }

  const data = await res.json();
  return data.translations.map((t) => t.text);
}

async function getUsage(apiKey) {
  const isFreeKey = apiKey.endsWith(":fx");
  const endpoint = isFreeKey
    ? "https://api-free.deepl.com/v2/usage"
    : "https://api-free.deepl.com/v2/usage";

  const res = await fetch(endpoint, {
    method: "GET",
    headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
  });

  if (!res.ok) return null;
  return res.json();
}

async function main() {
  await loadEnv();

  const apiKey =
    process.env.DEEPL_API_KEY ||
    process.env.DEEPL_AUTH_KEY ||
    process.env.NEXT_PUBLIC_DEEPL_API_KEY;

  if (!apiKey) {
    console.error("[test-deepl] DeepL API key not found in .env");
    process.exit(1);
  }

  const isFree = apiKey.endsWith(":fx");
  console.log(`[test-deepl] Using ${isFree ? "FREE" : "PRO"} plan endpoint`);

  console.log("\n========== Usage Before ==========");
  const usageBefore = await getUsage(apiKey);
  if (usageBefore) {
    console.log(`Character count: ${usageBefore.character_count} / ${usageBefore.character_limit}`);
    const remaining = usageBefore.character_limit - usageBefore.character_count;
    console.log(`Remaining: ${remaining.toLocaleString()} characters`);
  }

  const hotelsPath = path.join(projectRoot, "public", "data", "hotels.json");
  let hotelData;
  try {
    const raw = await fs.readFile(hotelsPath, "utf8");
    hotelData = JSON.parse(raw);
  } catch (err) {
    console.error("[test-deepl] Failed to load hotels.json:", err.message);
    process.exit(1);
  }

  // 중첩된 구조(권역 -> 성급 -> 배열)를 단일 배열로 통합
  const hotelArray = [];
  for (const region in hotelData) {
    const regionObj = hotelData[region];
    for (const rating in regionObj) {
      if (Array.isArray(regionObj[rating])) {
        hotelArray.push(...regionObj[rating]);
      }
    }
  }

  if (hotelArray.length === 0) {
    console.error("[test-deepl] Failed to extract hotels from structure");
    console.log("Top-level keys:", Object.keys(hotelData));
    process.exit(1);
  }

  console.log(`\n[test-deepl] Total hotels in source: ${hotelArray.length}`);

  const samples = [];
  const grades = ["5성", "4성", "3성"];
  for (const grade of grades) {
    const found = hotelArray.find(
      (h) => (h.rating === grade || h.grade === parseInt(grade)) && !samples.includes(h)
    );
    if (found) samples.push(found);
  }
  while (samples.length < 5 && samples.length < hotelArray.length) {
    const candidate = hotelArray[samples.length];
    if (!samples.includes(candidate)) samples.push(candidate);
  }

  console.log(`\n[test-deepl] Selected samples:`);
  samples.forEach((h, i) => {
    console.log(`  ${i + 1}. ${h.이름 || h.name} | ${h.주소 || h.address || "(no address)"}`);
  });

  const namesKo = samples.map((h) => (h.이름 || h.name || "").trim()).filter(Boolean);
  const addressesKo = samples.map((h) => (h.주소 || h.address || "").trim()).filter(Boolean);

  console.log(`\n========== Translation Results ==========`);

  for (const { code, label } of TARGET_LANGS) {
    console.log(`\n----- ${label.toUpperCase()} (DeepL: ${code}) -----`);
    try {
      const namesTranslated = await translateBatch(apiKey, namesKo, code);
      const addressesTranslated = await translateBatch(apiKey, addressesKo, code);

      for (let i = 0; i < samples.length; i++) {
        console.log(`\n[${i + 1}] ${samples[i].이름 || samples[i].name}`);
        console.log(`    name -> ${namesTranslated[i]}`);
        if (addressesKo[i]) {
          console.log(`    addr -> ${addressesTranslated[i]}`);
        }
      }
    } catch (err) {
      console.error(`  Error translating to ${label}: ${err.message}`);
    }
  }

  console.log("\n========== Usage After ==========");
  const usageAfter = await getUsage(apiKey);
  if (usageAfter && usageBefore) {
    const used = usageAfter.character_count - usageBefore.character_count;
    console.log(`Used in this test: ${used.toLocaleString()} characters`);
    console.log(`Total: ${usageAfter.character_count.toLocaleString()} / ${usageAfter.character_limit.toLocaleString()}`);

    const totalHotels = hotelArray.length;
    const avgCharsPerSample = used / 5;
    const estimatedTotal = avgCharsPerSample * totalHotels;
    console.log(`\n[Projection] If all ${totalHotels} hotels are translated:`);
    console.log(`  Estimated character usage: ${Math.round(estimatedTotal).toLocaleString()}`);
    console.log(`  As % of monthly limit: ${((estimatedTotal / usageAfter.character_limit) * 100).toFixed(1)}%`);
  }

  console.log("\n[test-deepl] Test completed successfully.");
}

main().catch((err) => {
  console.error("[test-deepl] Fatal error:", err);
  process.exit(1);
});
