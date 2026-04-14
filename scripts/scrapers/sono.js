const crypto = require('crypto');

async function scrapeSonoResorts() {
  console.log('[Scraper] Starting Daemyung Sono Promotion Scraper...');
  const promos = [
    {
      title: "오션월드 특별 할인 패키지 (소노펠리체)",
      imageUrl: "https://www.lottehotel.com/content/dam/lotte-hotel/global/common/offer/spring-main.jpg",
      period: "2024.05.01 - 2024.08.31",
      link: "https://www.sonohotelsresorts.com/event",
      category: "가족/레저/워터파크" // Resort Theme
    }
  ];

  return promos.map(promo => {
    const id = crypto.createHash('md5').update(promo.link).digest('hex');
    let endDate = null;
    if (promo.period.includes('-')) endDate = promo.period.split('-')[1].trim().replace(/\./g, '-');
    return { ...promo, id, hotelBrand: '대명소노', endDate, scrapedAt: new Date().toISOString() };
  });
}

module.exports = { scrapeSonoResorts };
