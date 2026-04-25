// scripts/diagnose-regions.mjs
// festivals.json의 region 분포 및 "대구경북권"으로 분류된 축제 상세 확인

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

const raw = await fs.readFile(
  path.join(projectRoot, "public", "data", "festivals.json"),
  "utf8"
);
const data = JSON.parse(raw);
const festivals = data.festivals || [];

// 권역별 개수 집계
const byRegion = {};
for (const f of festivals) {
  byRegion[f.region] = (byRegion[f.region] || 0) + 1;
}

console.log(`\n총 축제 수: ${festivals.length}`);
console.log(`\n권역별 분포:`);
for (const [region, count] of Object.entries(byRegion).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${region}: ${count}개`);
}

// 대구경북권으로 분류된 축제 전체 목록 (주소 포함)
console.log(`\n\n===== 대구경북권으로 분류된 축제 =====`);
const daeguGyeongbuk = festivals.filter((f) => f.region === "대구경북권");
for (const f of daeguGyeongbuk) {
  console.log(`  ${f.name}`);
  console.log(`    주소: ${f.location}`);
  console.log(`    기간: ${f.period}`);
  console.log("");
}
