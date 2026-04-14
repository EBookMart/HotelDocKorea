const fs = require('fs');
const path = require('path');
const { scrapeLotteHotels } = require('./scrapers/lotte');
const { scrapeShillaHotels } = require('./scrapers/shilla');
const { scrapeJosunHotels } = require('./scrapers/josun');
const { scrapeHanwhaResorts } = require('./scrapers/hanwha');
const { scrapeSonoResorts } = require('./scrapers/sono');
const { scrapeKumhoResorts } = require('./scrapers/kumho');

const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');

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

  // We iterate through all regions and ratings to access actual hotel objects
  for (const region in hotelsData) {
    for (const rating in hotelsData[region]) {
      const hotelsList = hotelsData[region][rating];
      
      hotelsList.forEach(hotel => {
        // --- A. Affiliate & Official Link Preparation ---
        if (!hotel.official_link) hotel.official_link = hotel.홈페이지 || '';
        
        // 아고다 도시명 검색 딥링크: 도시명을 query에 삽입하면 아고다 검색창에 자동 입력됨
        // 우선순위: 시도 → 세부지역 → 호텔명 (fallback)
        const AGODA_CID = '1896000';
        const cityName = hotel.시도 || hotel.세부지역 || hotel.이름;
        const encodedCity = encodeURIComponent(cityName);
        hotel.affiliate_link = `https://www.agoda.com/ko-kr/search?query=${encodedCity}&cid=${AGODA_CID}`;
        
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
      });
    }
  }

  console.log(`[Pipeline] Cleanup: Removed ${expiredCount} expired promotions.`);
  console.log(`[Pipeline] Match: Added ${newAddedCount} new promotions to ${updatedHotelsCount} hotel records.`);

  // 4. Save Back to Database (hotels.json)
  fs.writeFileSync(HOTELS_JSON_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');
  console.log('[Pipeline] Pipeline execution finished successfully.');
}

runPipeline().catch(err => {
  console.error('[Pipeline] Pipeline execution failed:', err);
  process.exit(1);
});
