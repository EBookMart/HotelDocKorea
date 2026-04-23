const fs = require('fs');
const path = require('path');

// ─── 환경 설정 ────────────────────────────────────────────────
const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');
const ROUTES_JSON_PATH = path.join(__dirname, '../public/data/airport-routes.json');
const PROGRESS_PATH = path.join(__dirname, '../public/data/airport_routes_progress.json');
const ENV_PATH = path.join(__dirname, '../.env');

// .env 로더 (보안 유지)
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

const ODSAY_API_KEY = process.env.ODSAY_API_KEY;
const NAVER_MAPS_KEY = process.env.NAVER_MAPS_KEY; // Directions 5 비밀키

// 공항 위치 정보 (Longitude, Latitude)
const AIRPORTS = [
  { id: 'ICN_T1', name: 'Incheon Int\'l Airport T1', lon: 126.4512, lat: 37.4485 },
  { id: 'ICN_T2', name: 'Incheon Int\'l Airport T2', lon: 126.4339, lat: 37.4685 },
  { id: 'GMP', name: 'Gimpo Int\'l Airport', lon: 126.8015, lat: 37.5581 }
];

// ─── API 호출 함수 ─────────────────────────────────────────────

/**
 * ODsay API를 이용한 대중교통 경로 검색 (영문 지원)
 */
async function fetchODsayPath(sx, sy, ex, ey) {
  if (!ODSAY_API_KEY) return null;
  
  const url = `https://api.odsay.com/v1/api/searchPubTransPathT?SX=${sx}&SY=${sy}&EX=${ex}&EY=${ey}&apiKey=${encodeURIComponent(ODSAY_API_KEY)}&lang=1&searchType=0`;

  try {
    const res = await fetch(url, {
      headers: {
        'Referer': 'http://localhost:3000'
      }
    });
    const data = await res.json();
    return data.result || null;
  } catch (err) {
    console.error('[ODsay Error]', err.message);
    return null;
  }
}

/**
 * Naver Directions 5 API를 이용한 차량/택시 예상 정보
 * (Naver Cloud Platform의 API Gateway Key 필요)
 */
async function fetchNaverTaxiInfo(sx, sy, ex, ey) {
  if (!NAVER_MAPS_KEY) return null;

  // Directions 5 API 엔드포인트
  const url = `https://naveropenapi.apigw.ntruss.com/map-direction/v1/driving?start=${sx},${sy}&goal=${ex},${ey}`;

  try {
    const res = await fetch(url, {
      headers: {
        'X-NCP-APIGW-API-KEY-ID': '여기에_ID_필요', // 클라이언트 ID (사용자 확인 필요)
        'X-NCP-APIGW-API-KEY': NAVER_MAPS_KEY     // 클라이언트 시크릿
      }
    });
    const data = await res.json();
    if (data.route && data.route.traoptimal && data.route.traoptimal[0]) {
      const summary = data.route.traoptimal[0].summary;
      return {
        duration: Math.round(summary.duration / 60000), // ms -> minutes
        cost: summary.taxiFare, // 예상 택시 요금
        distance: summary.distance / 1000 // m -> km
      };
    }
  } catch (err) {
    console.error('[Naver Error]', err.message);
  }
  return null;
}

// ─── 메인 실행 로직 ─────────────────────────────────────────────

async function generateRoutes() {
  console.log('[Routing] Starting Airport-Hotel Route Pipeline...');

  if (!fs.existsSync(HOTELS_JSON_PATH)) {
    console.error('hotels.json not found!');
    return;
  }

  const hotelsData = JSON.parse(fs.readFileSync(HOTELS_JSON_PATH, 'utf8'));
  let airportRoutes = {};

  // 기존 결과가 있으면 로드 (이어하기)
  if (fs.existsSync(ROUTES_JSON_PATH)) {
    airportRoutes = JSON.parse(fs.readFileSync(ROUTES_JSON_PATH, 'utf8'));
  }

  let requestCount = 0;
  const MAX_PER_DAY = 900; // 안전 마진 고려

  // 모든 호텔 순회
  for (const region in hotelsData) {
    for (const rating in hotelsData[region]) {
      const hotels = hotelsData[region][rating];
      
      for (const hotel of hotels) {
        if (!hotel.mapx || !hotel.mapy) continue;
        
        const hotelId = hotel.이름; // 식별자로 사용
        if (airportRoutes[hotelId]) continue; // 이미 생성된 경우 건너뜀

        console.log(`[Processing] ${hotelId}...`);
        airportRoutes[hotelId] = {
          hotelName: hotel.이름,
          fromAirports: {}
        };

        for (const airport of AIRPORTS) {
          if (requestCount >= MAX_PER_DAY) {
            console.warn('[Limit] Reached daily API limit. Saving progress...');
            saveResults(airportRoutes);
            return;
          }

          // 1. 대중교통 경로 (ODsay)
          const transportData = await fetchODsayPath(airport.lon, airport.lat, hotel.mapx, hotel.mapy);
          requestCount++;

          let routes = [];
          if (transportData && transportData.path) {
            transportData.path.slice(0, 2).forEach(p => {
              routes.push({
                type: 'public_transport',
                method: p.pathType === 1 ? 'Subway' : (p.pathType === 2 ? 'Bus' : 'Mixed'),
                durationMinutes: p.info.totalTime,
                costKrw: p.info.payment,
                transitCount: p.info.transitCount,
                tags: p.info.transitCount === 0 ? ['no-transfer', 'luggage-friendly'] : []
              });
            });
          }

          // 2. 택시 정보 (Naver - 일단 목업 혹은 ID 확보 후 연결)
          // Naver API ID가 필요하므로 일단 ODsay 데이터 기반으로 mock-up만 생성
          routes.push({
            type: 'taxi',
            method: 'International Taxi',
            durationMinutes: 60, // Mock
            costKrw: 75000,      // Mock Zone A
            tags: ['private', 'premium', 'door-to-door']
          });

          airportRoutes[hotelId].fromAirports[airport.id] = {
            airportName: airport.name,
            routes: routes
          };

          // API 지연 (Rate limit 방지)
          await new Promise(r => setTimeout(r, 100));
        }

        // 수시 저장
        saveResults(airportRoutes);
      }
    }
  }

  console.log('[Routing] Pipeline finished successfully.');
}

function saveResults(data) {
  fs.writeFileSync(ROUTES_JSON_PATH, JSON.stringify(data, null, 2));
}

generateRoutes().catch(err => {
  console.error('[Routing] Fatal Error:', err);
});
