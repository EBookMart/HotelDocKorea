// scripts/check-translations.mjs
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const languages = ["ko", "en", "ja", "zh", "es"];

console.log("\n[번역 현황 진단]");
for (const lang of languages) {
  try {
    const raw = await fs.readFile(path.join(projectRoot, "messages", `${lang}.json`), "utf8");
    const data = JSON.parse(raw);
    console.log(`\n--- ${lang}.json ---`);
    console.log(`  promoTitle: "${data.hotPicks?.promoTitle}"`);
    console.log(`  recommendedTitle: "${data.hotPicks?.recommendedTitle}"`);
  } catch (err) {
    console.log(`  ${lang}.json 읽기 실패: ${err.message}`);
  }
}
