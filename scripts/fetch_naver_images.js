const fs = require('fs');
const path = require('path');

// ─── 환경 설정 ────────────────────────────────────────────────
const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');
const LOG_FILE_PATH = path.join(__dirname, '../logs/failed_image_hotels.log');
const ENV_PATH = path.join(__dirname, '../.env');

// 로그 디렉토리 생성
if (!fs.existsSync(path.dirname(LOG_FILE_PATH))) {
  fs.mkdirSync(path.dirname(LOG_FILE_PATH), { recursive: true });
}

// .env 로더
function loadEnv() {
  if (fs.existsSync(ENV_PATH)) {
    const envContent = fs.readFileSync(ENV_PATH, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
  }
}
loadEnv();

const CLIENT_ID = process.env.NAVER_CLIENT_ID;
const CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

/**
 * 네이버 이미지 검색 API 호출
 */
async function searchNaverImage(query) {
  const url = `https://openapi.naver.com/v1/search/image?query=${encodeURIComponent(query)}&display=1&filter=large&sort=sim`;
  
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Naver-Client-Id': CLIENT_ID,
        'X-Naver-Client-Secret': CLIENT_SECRET
      },
      signal: AbortSignal.timeout(5000) // 5초 타임아웃
    });
    
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
    
    const data = await res.json();
    if (data.items && data.items.length > 0) {
      return {
        url: data.items[0].link,
        thumbnail: data.items[0].thumbnail
      };
    }
  } catch (err) {
    console.error(`[Naver API Error] ${query}:`, err.message);
  }
  return null;
}

// ─── 메인 실행 로직 ─────────────────────────────────────────────

async function runNaverImagePipeline() {
  console.log('🚀 [Naver Image Pipeline] Starting automation...');

  if (!fs.existsSync(HOTELS_JSON_PATH)) {
    console.error('hotels.json not found!');
    return;
  }

  const hotelsData = JSON.parse(fs.readFileSync(HOTELS_JSON_PATH, 'utf8'));
  let updatedCount = 0;
  let failedList = [];

  for (const region in hotelsData) {
    for (const rating in hotelsData[region]) {
      const hotels = hotelsData[region][rating];
      
      for (const hotel of hotels) {
        // 이미지가 없거나(null/비어있음) unsplash 더미 이미지가 적용된 경우만 수집
        const currentImg = hotel.imageUrl || '';
        const isMissing = currentImg === '' || currentImg.includes('unsplash');

        if (isMissing) {
          const query = `${hotel.시도} ${hotel.이름} 외관`;
          console.log(`[Processing] ${hotel.이름}...`);

          const result = await searchNaverImage(query);
          
          if (result) {
            hotel.imageUrl = result.url;
            hotel.thumbnailUrl = result.thumbnail; // 섬네일 정보도 별도 저장
            updatedCount++;
            console.log(` ✅ Found: ${result.url.slice(0, 50)}...`);
          } else {
            failedList.push(`${hotel.시도} | ${hotel.이름}`);
          }

          // Rate Limit 방지 (0.1초 대기)
          await new Promise(r => setTimeout(r, 100));
        }
      }
    }
  }

  // 데이터 저장
  fs.writeFileSync(HOTELS_JSON_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');

  // 실패 로그 기록
  if (failedList.length > 0) {
    fs.writeFileSync(LOG_FILE_PATH, failedList.join('\n'), 'utf8');
  }

  console.log(`\n🎉 Pipeline Finished!`);
  console.log(`- Updated: ${updatedCount} hotels`);
  console.log(`- Failed: ${failedList.length} hotels (Logged to failed_image_hotels.log)`);
}

runNaverImagePipeline().catch(err => {
  console.error('[Pipeline Fatal Error]:', err);
});
