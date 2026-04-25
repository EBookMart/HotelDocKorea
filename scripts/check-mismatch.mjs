// scripts/check-mismatch.mjs
// festivals.json 내에서 주소와 권역이 일치하지 않는 사례를 찾습니다.

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

const mismatches = festivals.filter(f => {
  if (f.region === "대구경북권") {
    // 대구경북권인데 주소에 대구, 경북, 경상북도가 없는 경우
    return !f.location.includes("대구") && !f.location.includes("경북") && !f.location.includes("경상북도");
  }
  return false;
});

if (mismatches.length === 0) {
  console.log("\n✅ 대구경북권으로 오분류된 축제가 데이터 파일 내에는 없습니다.");
} else {
  console.log(`\n❌ 오분류된 축제 ${mismatches.length}개를 발견했습니다:`);
  console.log(JSON.stringify(mismatches, null, 2));
}
