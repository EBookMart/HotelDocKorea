const fs = require('fs');
const path = require('path');

// ─── 환경 설정 ────────────────────────────────────────────────
const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');
const FESTIVALS_JSON_PATH = path.join(__dirname, '../public/data/festivals.json');
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

const SERVICE_KEY = process.env.TOUR_API_KEY;
const ENDPOINT = 'http://apis.data.go.kr/B551011/KorService2';

/**
 * 전역 유틸리티: 두 좌표 사이의 거리 계산 (Haversine 공식) - 단위: km
 */
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * AI 기반 해시태그 생성기 (Rule-based NLP Mockup)
 */
function generateAITags(title, overview) {
  const tags = [];
  const text = (title + ' ' + (overview || '')).toLowerCase();
  
  if (text.includes('가죽') || text.includes('어린이') || text.includes('체험') || text.includes('축제')) tags.push('#아이와함께');
  if (text.includes('야경') || text.includes('빛') || text.includes('데이트') || text.includes('공연')) tags.push('#커플데이트');
  if (text.includes('전통') || text.includes('역사') || text.includes('민속')) tags.push('#역사탐방');
  if (text.includes('음악') || text.includes('콘서트') || text.includes('페스티벌')) tags.push('#도심페스티벌');
  if (text.includes('꽃') || text.includes('단풍') || text.includes('계절')) tags.push('#인생샷명소');

  return tags.slice(0, 3);
}

/**
 * TourAPI 4.0: 축제 목록 조회 (KorService2 표준)
 */
async function fetchFestivals() {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const url = `${ENDPOINT}/searchFestival2?serviceKey=${SERVICE_KEY}&numOfRows=100&pageNo=1&MobileOS=ETC&MobileApp=HotelDocKorea&_type=json&listYN=Y&arrange=A&eventStartDate=${today}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.response.body.items.item || [];
  } catch (err) {
    console.error('[TourAPI Error] Festival List Fetch failed:', err.message);
    return [];
  }
}

// ─── 메인 실행 로직 ─────────────────────────────────────────────

async function runFestivalPipeline() {
  console.log('🎡 [Festival Pipeline] Starting legal data synchronization...');

  // 1. 축제 데이터 수집
  const items = await fetchFestivals();
  console.log(`- Fetched ${items.length} active festivals.`);

  // 2. 호텔 데이터 로드 (매핑용)
  const hotelsData = JSON.parse(fs.readFileSync(HOTELS_JSON_PATH, 'utf8'));
  const allHotels = [];
  for (const r in hotelsData) for (const s in hotelsData[r]) hotelsData[r][s].forEach(h => allHotels.push(h));

  // 3. 데이터 정제 및 매핑
  const processedFestivals = items.map(item => {
    // 3.1. 공간 인덱싱 (3km 이내 숙소 찾기)
    const nearbyHotels = allHotels
      .map(h => ({ name: h.이름, dist: getDistance(parseFloat(item.mapy), parseFloat(item.mapx), parseFloat(h.mapy), parseFloat(h.mapx)) }))
      .filter(h => h.dist <= 3)
      .sort((a,b) => a.dist - b.dist)
      .slice(0, 5);

    return {
      contentId: item.contentid,
      title: item.title,
      startDate: item.eventstartdate,
      endDate: item.eventenddate,
      address: item.addr1,
      imageUrl: item.firstimage || item.firstimage2,
      mapx: item.mapx,
      mapy: item.mapy,
      tel: item.tel,
      tags: generateAITags(item.title, ''), // AI 해시태그
      nearbyHotels: nearbyHotels.map(h => h.name),
      source: 'Korea Tourism Organization (TourAPI 4.0)'
    };
  });

  // 4. 결과 저장
  fs.writeFileSync(FESTIVALS_JSON_PATH, JSON.stringify(processedFestivals, null, 2), 'utf8');

  console.log('✅ [Festival Pipeline] Finished! Data stored in festivals.json');
  console.log(`- Total ${processedFestivals.length} matches found.`);
}

runFestivalPipeline().catch(err => {
  console.error('[Pipeline Fatal Error]:', err);
});
