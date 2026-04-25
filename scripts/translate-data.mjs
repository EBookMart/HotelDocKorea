// scripts/translate-data.mjs
// Phase 2B-3a: 호텔/프로모션/축제 데이터를 4개 언어로 일괄 번역
// 실행: npm run translate
//
// 출력 파일:
//   public/data/translations.json      — 통합 번역 데이터
//   public/data/translation-report.txt — 사용자 검토용 보고서
//   public/data/translation-cache.json — 재실행 시 캐시 (이미 번역된 항목 스킵)
//
// 원본 데이터 파일은 절대 수정하지 않습니다.

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const dataDir = path.join(projectRoot, "public", "data");

// ─────────────────────────────────────────────
// 환경 변수 로드
// ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────
// DeepL API 호출
// ─────────────────────────────────────────────
const TARGET_LANGS = [
  { code: "EN-US", label: "en" },
  { code: "JA", label: "ja" },
  { code: "ZH", label: "zh" },
  { code: "ES", label: "es" },
];

async function translateBatch(apiKey, texts, targetLang) {
  if (texts.length === 0) return [];

  const isFreeKey = apiKey.endsWith(":fx");
  const endpoint = isFreeKey
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";

  const params = new URLSearchParams();
  // Authorization 헤더 방식을 사용하기 위해 auth_key를 params에서 제외합니다.
  params.append("source_lang", "KO");
  params.append("target_lang", targetLang);
  for (const text of texts) {
    params.append("text", text);
  }

  let attempt = 0;
  const maxAttempts = 3;

  while (attempt < maxAttempts) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { 
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `DeepL-Auth-Key ${apiKey}`
        },
        body: params.toString(),
      });

      if (res.status === 429) {
        attempt++;
        const delay = 2000 * attempt;
        console.log(`  Rate limited. Waiting ${delay}ms before retry ${attempt}...`);
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText.slice(0, 300)}`);
      }

      const data = await res.json();
      return data.translations.map((t) => t.text);
    } catch (err) {
      attempt++;
      if (attempt >= maxAttempts) throw err;
      const delay = 1500 * attempt;
      console.log(`  Error, retry ${attempt}/${maxAttempts} after ${delay}ms: ${err.message}`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  throw new Error("Max retries exceeded");
}

async function getUsage(apiKey) {
  const isFreeKey = apiKey.endsWith(":fx");
  const endpoint = isFreeKey
    ? "https://api-free.deepl.com/v2/usage"
    : "https://api.deepl.com/v2/usage";
  try {
    const res = await fetch(endpoint, {
      method: "GET",
      headers: { Authorization: `DeepL-Auth-Key ${apiKey}` },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────
// 후처리 검증 — 한국어 잔재 감지
// ─────────────────────────────────────────────
const HANGUL_REGEX = /[\u3131-\u318E\uAC00-\uD7A3]/;

function detectKoreanResidue(translatedText, targetLang) {
  if (targetLang === "en" || targetLang === "es") {
    if (HANGUL_REGEX.test(translatedText)) return true;
  } else if (targetLang === "ja") {
    if (HANGUL_REGEX.test(translatedText)) return true;
  } else if (targetLang === "zh") {
    if (HANGUL_REGEX.test(translatedText)) return true;
  }
  return false;
}

// ─────────────────────────────────────────────
// 캐시 관리 (재실행 시 이미 번역된 항목 스킵)
// ─────────────────────────────────────────────
async function loadCache() {
  const cachePath = path.join(dataDir, "translation-cache.json");
  try {
    const raw = await fs.readFile(cachePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveCache(cache) {
  const cachePath = path.join(dataDir, "translation-cache.json");
  await fs.writeFile(cachePath, JSON.stringify(cache, null, 2), "utf8");
}

function cacheKey(text, lang) {
  return `${lang}:${text}`;
}

// ─────────────────────────────────────────────
// 일괄 번역 with 캐시
// ─────────────────────────────────────────────
async function translateAll(apiKey, texts, lang, cache) {
  const uncached = [];
  const uncachedIndices = [];

  for (let i = 0; i < texts.length; i++) {
    const key = cacheKey(texts[i], lang);
    if (!(key in cache)) {
      uncached.push(texts[i]);
      uncachedIndices.push(i);
    }
  }

  const BATCH_SIZE = 50;
  const results = new Array(texts.length);

  for (let i = 0; i < texts.length; i++) {
    const key = cacheKey(texts[i], lang);
    if (key in cache) {
      results[i] = cache[key];
    }
  }

  for (let i = 0; i < uncached.length; i += BATCH_SIZE) {
    const batch = uncached.slice(i, i + BATCH_SIZE);
    const batchIndices = uncachedIndices.slice(i, i + BATCH_SIZE);
    const targetLang = TARGET_LANGS.find((l) => l.label === lang).code;

    process.stdout.write(`    Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(uncached.length / BATCH_SIZE)} (${batch.length} items)... `);
    const translated = await translateBatch(apiKey, batch, targetLang);

    for (let j = 0; j < batch.length; j++) {
      const originalIdx = batchIndices[j];
      results[originalIdx] = translated[j];
      cache[cacheKey(batch[j], lang)] = translated[j];
    }
    console.log("done.");
  }

  return results;
}

// ─────────────────────────────────────────────
// 메인 로직
// ─────────────────────────────────────────────
async function main() {
  await loadEnv();
  const apiKey =
    process.env.DEEPL_API_KEY ||
    process.env.DEEPL_AUTH_KEY ||
    process.env.NEXT_PUBLIC_DEEPL_API_KEY;

  if (!apiKey) {
    console.error("[translate] DEEPL_API_KEY not found in .env");
    process.exit(1);
  }

  const isFree = apiKey.endsWith(":fx");
  console.log(`[translate] Using ${isFree ? "FREE" : "PRO"} plan endpoint`);

  const usageBefore = await getUsage(apiKey);
  if (usageBefore) {
    const remaining = usageBefore.character_limit - usageBefore.character_count;
    console.log(`[translate] Quota: ${usageBefore.character_count.toLocaleString()} / ${usageBefore.character_limit.toLocaleString()} (${remaining.toLocaleString()} remaining)`);
  }

  const cache = await loadCache();
  const cacheSizeBefore = Object.keys(cache).length;
  console.log(`[translate] Cache: ${cacheSizeBefore} entries loaded`);

  console.log(`\n[translate] Loading source files...`);

  // hotels.json 로드 및 중첩 구조 해제
  const hotelsData = JSON.parse(await fs.readFile(path.join(dataDir, "hotels.json"), "utf8"));
  const hotelArray = [];
  for (const region in hotelsData) {
    const regionObj = hotelsData[region];
    for (const rating in regionObj) {
      if (Array.isArray(regionObj[rating])) {
        hotelArray.push(...regionObj[rating]);
      }
    }
  }

  const hotPicksRaw = JSON.parse(await fs.readFile(path.join(dataDir, "hot-picks.json"), "utf8"));
  const promotions = hotPicksRaw.promotions || [];

  const festivalsRaw = JSON.parse(await fs.readFile(path.join(dataDir, "festivals.json"), "utf8"));
  const festivals = festivalsRaw.festivals || [];

  console.log(`  - hotels: ${hotelArray.length}`);
  console.log(`  - promotions: ${promotions.length}`);
  console.log(`  - festivals: ${festivals.length}`);

  const hotelNames = [...new Set(hotelArray.map((h) => (h.이름 || h.name || "").trim()).filter(Boolean))];
  const hotelAddresses = [...new Set(hotelArray.map((h) => (h.주소 || h.address || "").trim()).filter(Boolean))];
  const promoTitles = [...new Set(promotions.map((p) => (p.promoTitle || "").trim()).filter(Boolean))];
  const promoDiscounts = [...new Set(promotions.map((p) => (p.discount || "").trim()).filter(Boolean))];
  const festivalNames = [...new Set(festivals.map((f) => (f.name || "").trim()).filter(Boolean))];
  const festivalLocations = [...new Set(festivals.map((f) => (f.location || "").trim()).filter(Boolean))];
  const festivalDescriptions = [...new Set(festivals.map((f) => (f.description || "").trim()).filter(Boolean))];

  console.log(`\n[translate] Unique strings to translate:`);
  console.log(`  - hotel names: ${hotelNames.length}`);
  console.log(`  - hotel addresses: ${hotelAddresses.length}`);
  console.log(`  - promo titles: ${promoTitles.length}`);
  console.log(`  - promo discounts: ${promoDiscounts.length}`);
  console.log(`  - festival names: ${festivalNames.length}`);
  console.log(`  - festival locations: ${festivalLocations.length}`);
  console.log(`  - festival descriptions: ${festivalDescriptions.length}`);

  const result = {
    _generatedAt: new Date().toISOString(),
    _source: "DeepL API Free / KO -> EN, JA, ZH, ES",
    hotels: { names: {}, addresses: {} },
    promotions: { titles: {}, discounts: {} },
    festivals: { names: {}, locations: {}, descriptions: {} },
  };

  for (const { label } of TARGET_LANGS) {
    console.log(`\n========== Translating to ${label.toUpperCase()} ==========`);

    console.log(`  Hotel names...`);
    const namesT = await translateAll(apiKey, hotelNames, label, cache);
    result.hotels.names[label] = Object.fromEntries(hotelNames.map((ko, i) => [ko, namesT[i]]));

    console.log(`  Hotel addresses...`);
    const addrT = await translateAll(apiKey, hotelAddresses, label, cache);
    result.hotels.addresses[label] = Object.fromEntries(hotelAddresses.map((ko, i) => [ko, addrT[i]]));

    console.log(`  Promo titles...`);
    const titleT = await translateAll(apiKey, promoTitles, label, cache);
    result.promotions.titles[label] = Object.fromEntries(promoTitles.map((ko, i) => [ko, titleT[i]]));

    console.log(`  Promo discounts...`);
    const discT = await translateAll(apiKey, promoDiscounts, label, cache);
    result.promotions.discounts[label] = Object.fromEntries(promoDiscounts.map((ko, i) => [ko, discT[i]]));

    console.log(`  Festival names...`);
    const fnameT = await translateAll(apiKey, festivalNames, label, cache);
    result.festivals.names[label] = Object.fromEntries(festivalNames.map((ko, i) => [ko, fnameT[i]]));

    console.log(`  Festival locations...`);
    const flocT = await translateAll(apiKey, festivalLocations, label, cache);
    result.festivals.locations[label] = Object.fromEntries(festivalLocations.map((ko, i) => [ko, flocT[i]]));

    if (festivalDescriptions.length > 0) {
      console.log(`  Festival descriptions...`);
      const fdescT = await translateAll(apiKey, festivalDescriptions, label, cache);
      result.festivals.descriptions[label] = Object.fromEntries(festivalDescriptions.map((ko, i) => [ko, fdescT[i]]));
    } else {
      result.festivals.descriptions[label] = {};
    }

    await saveCache(cache);
  }

  const outPath = path.join(dataDir, "translations.json");
  await fs.writeFile(outPath, JSON.stringify(result, null, 2), "utf8");
  console.log(`\n[translate] Saved translations to ${outPath}`);

  console.log(`\n[translate] Generating quality report...`);
  const report = [];
  report.push(`HotelDocKorea Translation Quality Report`);
  report.push(`Generated: ${new Date().toISOString()}`);
  report.push(`========================================\n`);

  let issueCount = 0;

  report.push(`[Section 1] Korean residue detection`);
  report.push(`(번역 결과에 한글이 남아있는 경우 — 수동 보정 필요)\n`);

  for (const { label } of TARGET_LANGS) {
    const checkSection = (title, mapping) => {
      const issues = [];
      for (const [ko, translated] of Object.entries(mapping)) {
        if (detectKoreanResidue(translated, label)) {
          issues.push({ ko, translated });
        }
      }
      if (issues.length > 0) {
        report.push(`\n  [${label.toUpperCase()}] ${title} (${issues.length} issues):`);
        for (const { ko, translated } of issues) {
          report.push(`    KO: ${ko}`);
          report.push(`    ${label.toUpperCase()}: ${translated}`);
          report.push(``);
          issueCount++;
        }
      }
    };

    checkSection("Hotel names", result.hotels.names[label]);
    checkSection("Hotel addresses", result.hotels.addresses[label]);
    checkSection("Promo titles", result.promotions.titles[label]);
    checkSection("Festival names", result.festivals.names[label]);
    checkSection("Festival locations", result.festivals.locations[label]);
  }

  report.push(`\n\n[Section 2] Duplicate translations`);
  report.push(`(서로 다른 한국 호텔이 같은 외국어로 번역된 경우 — 구별 불가, 수동 보정 필요)\n`);

  for (const { label } of TARGET_LANGS) {
    const inverseMap = {};
    for (const [ko, translated] of Object.entries(result.hotels.names[label])) {
      if (!inverseMap[translated]) inverseMap[translated] = [];
      inverseMap[translated].push(ko);
    }
    const duplicates = Object.entries(inverseMap).filter(([_, kos]) => kos.length > 1);
    if (duplicates.length > 0) {
      report.push(`\n  [${label.toUpperCase()}] Duplicate hotel names (${duplicates.length}):`);
      for (const [translated, kos] of duplicates) {
        report.push(`    "${translated}" ←`);
        for (const ko of kos) {
          report.push(`        ${ko}`);
        }
        report.push(``);
        issueCount += kos.length - 1;
      }
    }
  }

  report.push(`\n\n[Section 3] Statistics`);
  report.push(`Total unique strings translated:`);
  report.push(`  - Hotel names: ${hotelNames.length}`);
  report.push(`  - Hotel addresses: ${hotelAddresses.length}`);
  report.push(`  - Promotion titles: ${promoTitles.length}`);
  report.push(`  - Festival names: ${festivalNames.length}`);
  report.push(`Total issues flagged: ${issueCount}`);

  const usageAfter = await getUsage(apiKey);
  if (usageBefore && usageAfter) {
    const used = usageAfter.character_count - usageBefore.character_count;
    report.push(`\nDeepL API usage:`);
    report.push(`  Used in this run: ${used.toLocaleString()} characters`);
    report.push(`  Total: ${usageAfter.character_count.toLocaleString()} / ${usageAfter.character_limit.toLocaleString()}`);
  }

  const reportPath = path.join(dataDir, "translation-report.txt");
  await fs.writeFile(reportPath, report.join("\n"), "utf8");
  console.log(`[translate] Quality report saved to ${reportPath}`);

  console.log(`\n========================================`);
  console.log(`[translate] Completed.`);
  console.log(`  Total issues to review: ${issueCount}`);
  console.log(`  Cache entries: ${Object.keys(cache).length} (was ${cacheSizeBefore})`);
  console.log(`========================================`);
}

main().catch((err) => {
  console.error("[translate] Fatal error:", err);
  process.exit(1);
});
