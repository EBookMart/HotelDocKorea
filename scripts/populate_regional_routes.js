const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, '../public/data/airport-routes.json');
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

const regionalData = {
  "파크 하얏트 부산": {
    "hotelName": "파크 하얏트 부산",
    "region": "부산",
    "type": "regional",
    "fromAirports": {
      "ICN": {
        "airportName": "Incheon Int'l Airport",
        "options": [
          {
            "id": "ktx",
            "title": { "ko": "KTX 열차 (추천)", "en": "KTX Train (Fastest)", "ja": "KTX 列車 (おすすめ)" },
            "summary": { "ko": "서울역 환승 • 약 3.5시간", "en": "Transfer at Seoul St. • ~3.5h", "ja": "ソウル駅乗換 • 約3.5時間" },
            "cost": "약 85,000 KRW",
            "steps": [
              { "ko": "공항철도(AREX)로 서울역 이동", "en": "Take AREX to Seoul Station", "ja": "空港鉄道(AREX)でソウル駅へ" },
              { "ko": "KTX 경부선 (부산행) 환승", "en": "Transfer to KTX (Gyeongbu Line)", "ja": "KTX 京釜線 (釜山行) に乗換" },
              { "ko": "부산역에서 호텔까지 택시 이동", "en": "Taxi from Busan St. to Hotel", "ja": "釜山駅からホテルまでタクシー" }
            ],
            "booking": { "name": "Trip.com (KTX)", "url": "https://www.trip.com/trains/south-korea/" }
          },
          {
            "id": "bus",
            "title": { "ko": "지방 직행 리무진", "en": "Direct Intercity Bus", "ja": "地方直行リムジン" },
            "summary": { "ko": "무환승 • 약 5시간", "en": "No Transfer • ~5h", "ja": "乗換なし • 約5時間" },
            "cost": "약 48,000 KRW",
            "steps": [
              { "ko": "1층 입국장 매표소(4, 9번 게이트)에서 티켓 구입", "en": "Buy ticket at 1F Ticket Office (Gate 4, 9)", "ja": "1階到着ロビー券売所(4, 9番ゲート)でチケット購入" },
              { "ko": "T1 11A번 승강장에서 부산행 버스 탑승", "en": "Board Busan bus at T1 Platform 11A", "ja": "T1 11A番乗り場で釜山行バスに搭乗" }
            ],
            "booking": { "name": "Klook (Bus)", "url": "https://www.klook.com/" }
          }
        ]
      },
      "GMP": {
        "airportName": "Gimpo Int'l Airport",
        "options": [
          {
            "id": "flight",
            "title": { "ko": "국내선 항공", "en": "Domestic Flight", "ja": "国内線航空" },
            "summary": { "ko": "김해공항행 • 1시간", "en": "To Gimhae(PUS) • 1h", "ja": "金海空港行 • 1時間" },
            "cost": "Variable",
            "steps": [
              { "ko": "김포공항 국내선 터미널 이동", "en": "Go to GMP Domestic Terminal", "ja": "金浦空港国内線ターミナルへ" },
              { "ko": "김해공항(PUS) 도착 후 택시 이용", "en": "Arrive at PUS & Take Taxi", "ja": "金海空港到着後タクシー利用" }
            ],
            "booking": { "name": "Skyscanner", "url": "https://www.skyscanner.net/" }
          }
        ]
      }
    }
  },
  "롯데호텔 제주": {
    "hotelName": "롯데호텔 제주",
    "region": "제주",
    "type": "regional",
    "fromAirports": {
      "ICN": {
        "airportName": "Incheon Int'l Airport",
        "options": [
          {
             "id": "transfer_gmp",
             "title": { "ko": "김포공항 환승 (추천)", "en": "GMP Transfer (Best)", "ja": "金浦空港乗換 (おすすめ)" },
             "summary": { "ko": "공항철도 이동 + 국내선", "en": "AREX + Domestic Flight", "ja": "空港鉄道 + 国内線" },
             "steps": [
                { "ko": "공항철도로 김포공항 이동 (38분)", "en": "AREX to Gimpo Airport (38m)", "ja": "空港鉄道で金浦空港へ (38分)" },
                { "ko": "국내선 항공편으로 제주 이동 (1시간)", "en": "Fly to Jeju (CJU) (1h)", "ja": "国内線で済州へ (1時間)" }
             ],
             "booking": { "name": "Trip.com (Flights)", "url": "https://www.trip.com/flights/" }
          }
        ]
      },
      "CJU": {
         "airportName": "Jeju Int'l Airport",
         "options": [
            {
               "id": "limousine",
               "title": { "ko": "공항 리무진 (600번)", "en": "Airport Limousine (600)", "ja": "空港リムジン (600番)" },
               "summary": { "ko": "직행 • 약 50분", "en": "Direct • ~50m", "ja": "直行 • 約50分" },
               "steps": [
                  { "ko": "제주공항 5번 게이트 앞 승차", "en": "Board at Gate 5, Jeju Airport", "ja": "済州空港5番ゲート前で搭乗" },
                  { "ko": "중문관광단지 롯데호텔 하차", "en": "Alight at Lotte Hotel (Jungmun)", "ja": "中文観光団地ロッテホテル下車" }
               ]
            }
         ]
      }
    }
  },
  "세인트존스 호텔": {
    "hotelName": "세인트존스 호텔",
    "region": "강릉",
    "type": "regional",
    "fromAirports": {
      "ICN": {
        "airportName": "Incheon Int'l Airport",
        "options": [
          {
            "id": "ktx",
            "title": { "ko": "강릉선 KTX", "en": "Gangneung KTX", "ja": "江陵線 KTX" },
            "summary": { "ko": "서울역 환승 • 약 3시간", "en": "Transfer at Seoul St. • ~3h", "ja": "ソウル駅乗換 • 約3時間" },
            "steps": [
              { "ko": "공항철도로 서울역 이동", "en": "AREX to Seoul Station", "ja": "空港鉄道でソウル駅へ" },
              { "ko": "KTX 강릉선 환승", "en": "Transfer to KTX Gangneung", "ja": "KTX 江陵線に乗換" },
              { "ko": "강릉역에서 택시 이동 (10분)", "en": "Taxi from Gangneung St. (10m)", "ja": "江陵駅からタクシー (10分)" }
            ],
            "booking": { "name": "Trip.com (KTX)", "url": "https://www.trip.com/trains/south-korea/" }
          }
        ]
      }
    }
  }
};

// Merge
Object.assign(routes, regionalData);

fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2), 'utf8');
console.log('✅ Regional intermodal data populated.');
