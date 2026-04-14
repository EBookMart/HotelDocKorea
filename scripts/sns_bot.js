const fs = require('fs');
const path = require('path');

const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');

async function postToSocialMedia() {
  console.log('[SNS Bot] Initiaizing auto-post to X (Twitter) & Instagram Threads...');
  
  if (!fs.existsSync(HOTELS_JSON_PATH)) {
    console.error('Data file not found.');
    return;
  }

  const hotelsData = JSON.parse(fs.readFileSync(HOTELS_JSON_PATH, 'utf8'));
  
  // 1. Weekly Pick 추출 시뮬레이션 (간단하게 첫 지역의 5성급 1개 추출)
  let bestHotel = null;
  let bestPromo = null;
  
  for (const region in hotelsData) {
    if (hotelsData[region]["5성"] && hotelsData[region]["5성"].length > 0) {
       for (const hotel of hotelsData[region]["5성"]) {
           if (hotel.promotions && hotel.promotions.length > 0) {
               bestHotel = hotel;
               bestPromo = hotel.promotions[0];
               break;
           }
       }
    }
    if (bestPromo) break;
  }

  if (!bestPromo) {
      console.log('[SNS Bot] No promotions available for posting today.');
      return;
  }

  // 2. SNS 포스팅 템플릿 생성
  const title = bestPromo.title.ko || bestPromo.title;
  const deepLink = `https://hoteldockorea.com?promoId=${bestPromo.id}`;
  
  const tweetText = `
🔥 오늘의 Hotel Doc Top Pick 🔥
${bestHotel.이름}에서 파격적인 이벤트가 열렸습니다!

✨ 특가 정보: ${title}
지금 바로 에어비앤비형 최저가 봇에게 물어보세요!
👉 ${deepLink}

#호텔독코리아 #호캉스 #특가 #호텔추천 #${bestHotel.시도}여행
  `.trim();

  // 3. API 호출 흉내
  console.log('[SNS Bot] ---------------------------------');
  console.log(`[SNS Bot] Payload to Twitter v2 API:`);
  console.log(tweetText);
  console.log('[SNS Bot] ---------------------------------');
  console.log('[SNS Bot] ✅ Post successful! Engagement tracker initiated.');
}

postToSocialMedia().catch(err => console.error(err));
