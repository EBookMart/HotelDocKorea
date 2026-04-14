const crypto = require('crypto');

async function scrapeKumhoResorts() {
  console.log('[Scraper] Starting Kumho Resorts Promotion Scraper...');
  const promos = [
    {
      title: "제주 아쿠아나 워터파크 패밀리 특가",
      imageUrl: "https://www.lottehotel.com/content/dam/lotte-hotel/global/common/offer/spring-main.jpg",
      period: "2024.03.01 - 2024.07.31",
      link: "https://www.kumhoresort.co.kr/event",
      category: "가족/레저/제주" // Resort Theme
    }
  ];

  return promos.map(promo => {
    const id = crypto.createHash('md5').update(promo.link).digest('hex');
    let endDate = null;
    if (promo.period.includes('-')) endDate = promo.period.split('-')[1].trim().replace(/\./g, '-');
    return { ...promo, id, hotelBrand: '금호리조트', endDate, scrapedAt: new Date().toISOString() };
  });
}

module.exports = { scrapeKumhoResorts };
