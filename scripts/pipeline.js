const fs = require('fs');
const path = require('path');
const { scrapeLotteHotels } = require('./scrapers/lotte');
const { scrapeShillaHotels } = require('./scrapers/shilla');
const { scrapeJosunHotels } = require('./scrapers/josun');
const { scrapeHanwhaResorts } = require('./scrapers/hanwha');
const { scrapeSonoResorts } = require('./scrapers/sono');
const { scrapeKumhoResorts } = require('./scrapers/kumho');

const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');
const BACKUP_JSON_PATH = path.join(__dirname, '../public/data/hotels.json.bak');
const ENV_PATH = path.join(__dirname, '../.env');

/**
 * 프로젝트 안전을 위한 백업/복구 시스템
 */
function backupData() {
  if (fs.existsSync(HOTELS_JSON_PATH)) {
    fs.copyFileSync(HOTELS_JSON_PATH, BACKUP_JSON_PATH);
    console.log('[Safety] Backup created.');
  }
}

function restoreData() {
  if (fs.existsSync(BACKUP_JSON_PATH)) {
    fs.copyFileSync(BACKUP_JSON_PATH, HOTELS_JSON_PATH);
    console.log('[Safety] ⚠️ Error detected. Data restored from backup.');
  }
}

function cleanupBackup() {
  if (fs.existsSync(BACKUP_JSON_PATH)) {
    fs.unlinkSync(BACKUP_JSON_PATH);
    console.log('[Safety] Backup cleaned up.');
  }
}

// Simple .env loader
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

const TOUR_API_KEY = process.env.TOUR_API_KEY;
const TOUR_API_ENDPOINT = process.env.TOUR_API_ENDPOINT_KO || 'https://apis.data.go.kr/B551011/KorService2';

/**
 * TourAPI에서 호텔 사진을 검색하여 가져옵니다.
 */
async function fetchTourAPIImage(hotelName, address) {
  if (!TOUR_API_KEY) return null;
  
  // 키워드 정제: '호텔', '리조트' 등 제거하여 검색 확률 향상
  const cleanName = hotelName.replace(/호텔|리조트|Hotel|Resort/g, '').trim();
  const url = `${TOUR_API_ENDPOINT}/searchKeyword2?serviceKey=${TOUR_API_KEY}&numOfRows=1&pageNo=1&MobileOS=ETC&MobileApp=HotelDocKorea&_type=json&keyword=${encodeURIComponent(cleanName)}&contentTypeId=32`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    const items = data?.response?.body?.items?.item;
    
    if (items) {
      const item = Array.isArray(items) ? items[0] : items;
      // firstimage 또는 firstimage2 반환
      return item.firstimage || item.firstimage2 || null;
    }
  } catch (err) {
    console.error(`[TourAPI] Failed to fetch for ${hotelName}:`, err.message);
  }
  return null;
}

// Helper to determine if a promotion has expired
function isExpired(endDateStr) {
  if (!endDateStr) return false; // If no clear end date, keep it (or decide to expire)
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  const endDate = new Date(endDateStr);
  return endDate < today;
}

async function runPipeline() {
  console.log('[Pipeline] Starting HotelDocKorea Automation Pipeline...');

  // 1. Run Scrapers
  const lottePromotions = await scrapeLotteHotels();
  const shillaPromotions = await scrapeShillaHotels();
  const josunPromotions = await scrapeJosunHotels();
  const hanwhaPromotions = await scrapeHanwhaResorts();
  const sonoPromotions = await scrapeSonoResorts();
  const kumhoPromotions = await scrapeKumhoResorts();
  
  const allPromotions = [...lottePromotions, ...shillaPromotions, ...josunPromotions, ...hanwhaPromotions, ...sonoPromotions, ...kumhoPromotions];
  console.log(`[Pipeline] Collected a total of ${allPromotions.length} raw promotions.`);

  // 2. Load Existing Data
  if (!fs.existsSync(HOTELS_JSON_PATH)) {
    console.error(`[Pipeline] Fatal: hotels.json not found at ${HOTELS_JSON_PATH}`);
    process.exit(1);
  }
  
  let hotelsData = {};
  try {
    const rawData = fs.readFileSync(HOTELS_JSON_PATH, 'utf8');
    hotelsData = JSON.parse(rawData);
  } catch (err) {
    console.error(`[Pipeline] Error parsing hotels.json:`, err);
    process.exit(1);
  }

  // 3. Process and Clean Data
  let updatedHotelsCount = 0;
  let expiredCount = 0;
  let newAddedCount = 0;
  let imageUpdatedCount = 0;

  // We iterate through all regions and ratings
  for (const region in hotelsData) {
    for (const rating in hotelsData[region]) {
      const hotelsList = hotelsData[region][rating];
      
      // 순차 처리를 위해 for...of 사용 (TourAPI Rate Limit 방지)
      for (const hotel of hotelsList) {
        // --- A. Affiliate & Official Link Preparation ---
        if (!hotel.official_link) hotel.official_link = hotel.홈페이지 || '';
        
        const AGODA_CID = '1896000';
        const cityName = hotel.시도 || hotel.세부지역 || hotel.이름;
        const encodedCity = encodeURIComponent(cityName);
        hotel.affiliate_link = `https://www.agoda.com/ko-kr/search?query=${encodedCity}&cid=${AGODA_CID}`;

        // --- B. Image Update (Selective) ---
        // 이미지가 없거나 Unsplash 등 임시 이미지를 사용하는 경우만 업데이트
        const isMissingImage = !hotel.imageUrl || hotel.imageUrl.includes('unsplash') || hotel.imageUrl === '';
        if (isMissingImage) {
          console.log(`[TourAPI] Attempting to find image for: ${hotel.이름}...`);
          const newImg = await fetchTourAPIImage(hotel.이름, hotel.시도);
          if (newImg) {
            hotel.imageUrl = newImg;
            imageUpdatedCount++;
            console.log(`[TourAPI] ✅ Image found: ${newImg.slice(0, 50)}...`);
            // API 과부하 방지를 위한 미세 지연
            await new Promise(r => setTimeout(r, 200));
          }
        }
        
        // Ensure promotions array exists
        if (!hotel.promotions) {
          hotel.promotions = [];
        }

        // --- B. Cleanup Expired Promotions ---
        const initialPromoLength = hotel.promotions.length;
        hotel.promotions = hotel.promotions.filter(promo => {
          if (isExpired(promo.endDate)) {
            expiredCount++;
            return false;
          }
          return true;
        });

        // --- C. Match and Insert New Promotions ---
        let matchBrand = null;
        if (hotel.이름.includes('롯데')) matchBrand = '롯데호텔';
        else if (hotel.이름.includes('신라')) matchBrand = '신라호텔';
        else if (hotel.이름.includes('조선')) matchBrand = '조선호텔';
        else if (hotel.이름.includes('한화')) matchBrand = '한화리조트';
        else if (hotel.이름.includes('소노') || hotel.이름.includes('대명')) matchBrand = '대명소노';
        else if (hotel.이름.includes('금호')) matchBrand = '금호리조트';

        if (matchBrand) {
          const brandPromos = allPromotions.filter(p => p.hotelBrand === matchBrand);
          
          brandPromos.forEach(newPromo => {
            // Uniqueness Check
            const exists = hotel.promotions.some(existing => existing.id === newPromo.id);
            if (!exists) {
              // --- Translation Module Injection (Mock) ---
              // Only translate if title is still a plain string (prevent double-wrapping)
              if (typeof newPromo.title === 'string') {
                const baseTitle = newPromo.title;
                newPromo.title = {
                  ko: baseTitle,
                  en: `[EN] ${baseTitle}`,
                  ja: `[JA] ${baseTitle}`
                };
              }

              // --- Notification Service Trigger (Mock) ---
              const koTitle = typeof newPromo.title === 'string' ? newPromo.title : (newPromo.title.ko || '');
              if (rating === "5성" || koTitle.includes('초특가') || koTitle.includes('특가')) {
                  console.log(`\n[Notification] 📬 Sending Email/Kakao Alert for: ${koTitle} (${hotel.이름})`);
                  console.log(`[Notification] -> Affilliate Deep Link: ${hotel.affiliate_link}`);
              }

              hotel.promotions.push(newPromo);
              newAddedCount++;
              updatedHotelsCount++;
            }
          });
        }
      }
    }
  }

  console.log(`[Pipeline] Cleanup: Removed ${expiredCount} expired promotions.`);
  console.log(`[Pipeline] Match: Added ${newAddedCount} new promotions to ${updatedHotelsCount} hotel records.`);
  console.log(`[Pipeline] TourAPI: Updated images for ${imageUpdatedCount} hotels.`);

  // 4. Save Back to Database (hotels.json)
  fs.writeFileSync(HOTELS_JSON_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');
  console.log('[Pipeline] Pipeline execution finished successfully.');
  cleanupBackup();
}

backupData();
runPipeline().catch(err => {
  console.error('[Pipeline] ❌ Pipeline execution failed:', err);
  restoreData();
  process.exit(1);
});
