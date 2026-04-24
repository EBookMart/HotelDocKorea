const fs = require('fs');
const path = require('path');

// 1. Update hotels.json with ZimCarry metadata
const hotelsPath = path.join(__dirname, '../public/data/hotels.json');
const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));

// Randomly assign some hotels as ZimCarry registered for demo
const regionKeys = ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도"];
regionKeys.forEach(region => {
  const regionData = hotels[region];
  if (regionData) {
    Object.keys(regionData).forEach(grade => {
      regionData[grade].forEach((hotel, idx) => {
        // Register about 30% of hotels
        if (idx % 3 === 0) {
          hotel.zimcarry_registered = true;
          hotel.zimcarry_deadline = idx % 2 === 0 ? "11:00 AM" : "3:00 PM";
        } else {
          hotel.zimcarry_registered = false;
        }
      });
    });
  }
});

fs.writeFileSync(hotelsPath, JSON.stringify(hotels, null, 2), 'utf8');
console.log('✅ hotels.json updated with ZimCarry metadata.');

// 2. Update airport-routes.json with GTX-A and KTX delay info
const routesPath = path.join(__dirname, '../public/data/airport-routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

// Update Regional Hotels (Example: Busan)
if (routes["파크 하얏트 부산"]) {
  const busan = routes["파크 하얏트 부산"];
  
  // Update ICN Options
  const icn = busan.fromAirports.ICN;
  
  // Add GTX-A Option (Priority 1 after June 2026 simulator)
  const gtxOption = {
    "id": "gtx_srt",
    "isFastest": true,
    "title": { "ko": "GTX-A + SRT (가장 빠름)", "en": "GTX-A + SRT (Fastest)", "ja": "GTX-A + SRT (最短)" },
    "summary": { "ko": "서울역-수서 직결 • 약 3시간", "en": "Seoul St.-Suseo Direct • ~3h", "ja": "ソウル駅-水西直結 • 約3時間" },
    "cost": "약 82,000 KRW",
    "steps": [
      { "ko": "공항철도로 서울역 이동", "en": "AREX to Seoul Station", "ja": "空港鉄道でソウル駅へ" },
      { "ko": "GTX-A 환승하여 수서역 이동 (15분)", "en": "Transfer to GTX-A to Suseo (15m)", "ja": "GTX-Aに乗り換えて水西駅へ(15分)" },
      { "ko": "수서역에서 SRT 환승하여 부산역 이동", "en": "Transfer to SRT at Suseo to Busan", "ja": "水西駅でSRTに乗り換えて釜山駅へ" }
    ],
    "booking": { "name": "Klook (Live Seats)", "url": "https://www.klook.com/ko/rails-24/1012-south-korea/" }
  };

  // Update KTX Option to highlight 6770 Limousine
  const ktxOption = icn.options.find(o => o.id === 'ktx');
  if (ktxOption) {
    ktxOption.title.ko = "리무진(6770) + KTX (현재 최선)";
    ktxOption.summary.ko = "광명역 환승 • 인천발 직결 KTX는 2026년 말 개통 예정";
    ktxOption.steps.unshift({ "ko": "T1 1F 8A 승강장에서 6770 리무진 탑승", "en": "Take 6770 Limousine at T1 8A", "ja": "T1 8A乗り場で6770リムジン搭乗" });
    ktxOption.booking = { "name": "Klook (Live QR)", "url": "https://www.klook.com/ko/rails-24/1012-south-korea/" };
  }

  // Insert GTX option at the beginning
  icn.options.unshift(gtxOption);
}

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2), 'utf8');
console.log('✅ airport-routes.json updated with Phase 3B logic.');
