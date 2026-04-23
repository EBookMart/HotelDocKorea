const fs = require('fs');
const path = require('path');

// ─── 환경 설정 ────────────────────────────────────────────────
const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');
const REPUTATION_JSON_PATH = path.join(__dirname, '../public/data/reputation.json');
const ENV_PATH = path.join(__dirname, '../.env');

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

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Google Places API (New) - Text Search 호출 (비용 최적화 적용)
 */
async function fetchGoogleReputation(hotelName, address) {
  if (!GOOGLE_API_KEY) return null;

  const url = 'https://places.googleapis.com/v1/places:searchText';
  const body = {
    textQuery: `${hotelName} ${address}`,
    maxResultCount: 1,
    languageCode: 'en' // 글로벌 평판을 위해 영어 기준 데이터 권장
  };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        // 지시서에 따른 필수 FieldMask 적용 (비용 절감 핵심)
        'X-Goog-FieldMask': 'places.rating,places.userRatingCount,places.id'
      },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    if (data.places && data.places.length > 0) {
      return {
        id: data.places[0].id,
        rating: data.places[0].rating || 0,
        userRatingCount: data.places[0].userRatingCount || 0
      };
    }
  } catch (err) {
    console.error(`[Google API Error] ${hotelName}:`, err.message);
  }
  return null;
}

// ─── 메인 실행 로직 ─────────────────────────────────────────────

async function generateReputation() {
  console.log('📊 [Reputation Pipeline] Starting Bayesian Ranking computation...');

  if (!fs.existsSync(HOTELS_JSON_PATH)) {
    console.error('hotels.json not found!');
    return;
  }

  const hotelsData = JSON.parse(fs.readFileSync(HOTELS_JSON_PATH, 'utf8'));
  let reputationCache = {};

  // 기존 캐시 로드 (Fallback용)
  if (fs.existsSync(REPUTATION_JSON_PATH)) {
    reputationCache = JSON.parse(fs.readFileSync(REPUTATION_JSON_PATH, 'utf8'));
  }

  const results = [];
  let totalRating = 0;
  let totalReviews = 0;
  let validCount = 0;

  // 1. 데이터 수집 (Google Places API)
  for (const region in hotelsData) {
    for (const rating in hotelsData[region]) {
      for (const hotel of hotelsData[region][rating]) {
        console.log(`[Fetching] ${hotel.이름}...`);
        
        const data = await fetchGoogleReputation(hotel.이름, hotel.주소);
        
        const info = data || reputationCache[hotel.이름] || { rating: 0, userRatingCount: 0 };
        
        results.push({
          name: hotel.이름,
          v: info.rating,
          R: info.userRatingCount
        });

        if (info.rating > 0) {
          totalRating += info.rating;
          totalReviews += info.userRatingCount;
          validCount++;
        }

        // 지연 (API 할당량 및 안정성 고려)
        await new Promise(r => setTimeout(r, 100));
      }
    }
  }

  // 2. 베이지안 평균 변수 산출
  const m = totalRating / validCount; // 전체 호텔 평균 평점
  const C = totalReviews / validCount; // 전체 호텔 평균 리뷰 수

  console.log(`- Data Stats: m=${m.toFixed(2)}, C=${C.toFixed(2)}`);

  // 3. 가중 평판 점수(W) 계산
  const finalReputation = {};
  results.forEach(item => {
    const R = item.R;
    const v = item.v;
    
    // Bayesian Average Formula: W = (R*v + C*m) / (R + C)
    // R=0인 경우 분모가 0이 되지 않도록 C*m으로 보정 처리 루틴 포함
    const W = (R * v + C * m) / (R + C || 1);
    
    finalReputation[item.name] = {
      weightedScore: W,
      originalRating: v,
      reviewCount: R,
      updatedAt: new Date().toISOString()
    };
  });

  // 4. 저장
  fs.writeFileSync(REPUTATION_JSON_PATH, JSON.stringify(finalReputation, null, 2));
  console.log('✅ [Reputation Pipeline] Finished successfully.');
}

generateReputation().catch(err => {
  console.error('[Pipeline Fatal Error]:', err);
});
