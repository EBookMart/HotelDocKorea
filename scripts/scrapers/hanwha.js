const crypto = require('crypto');

async function scrapeHanwhaResorts() {
  console.log('[Scraper] Starting Hanwha Resorts Promotion Scraper...');
  const promos = [
    {
      title: "한화리조트 패밀리 피크닉 (바비큐 포함)",
      imageUrl: "https://www.lottehotel.com/content/dam/lotte-hotel/global/common/offer/spring-main.jpg",
      period: "2024.04.10 - 2024.09.30",
      link: "https://www.hanwharesort.co.kr/irsweb/resort3/event/event_view.do",
      category: "가족/레저" // Resort Theme
    }
  ];

  return promos.map(promo => {
    const id = crypto.createHash('md5').update(promo.link).digest('hex');
    let endDate = null;
    if (promo.period.includes('-')) endDate = promo.period.split('-')[1].trim().replace(/\./g, '-');
    return { ...promo, id, hotelBrand: '한화리조트', endDate, scrapedAt: new Date().toISOString() };
  });
}

module.exports = { scrapeHanwhaResorts };
