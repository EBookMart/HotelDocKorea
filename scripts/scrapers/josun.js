const puppeteer = require('puppeteer');
const crypto = require('crypto');

async function scrapeJosunHotels() {
  console.log('[Scraper] Starting Josun Hotels Promotion Scraper...');
  // Mock logic replicating the scraper engine for Josun Hotels
  
  const promos = [
    {
      title: "프리미엄 골프 라운딩 패키지",
      imageUrl: "https://www.josunhotel.com/images/eno/sub/prom/2024/03/golf.jpg",
      period: "2024.03.15 - 2024.10.31",
      link: "https://www.josunhotel.com/offers/golf",
      category: "레저/골프"
    },
    {
      title: "패밀리 겟어웨이 (조식 4인 및 워터파크)",
      imageUrl: "https://www.josunhotel.com/images/eno/sub/prom/2024/03/family.jpg",
      period: "2024.05.01 - 2024.08.31",
      link: "https://www.josunhotel.com/offers/family",
      category: "가족/키즈"
    }
  ];

  return promos.map(promo => {
    const id = crypto.createHash('md5').update(promo.link).digest('hex');
    let endDate = null;
    if (promo.period.includes('-')) {
      let rawEnd = promo.period.split('-')[1].trim().replace(/\./g, '-');
      endDate = rawEnd;
    }
    
    return {
      ...promo,
      id,
      hotelBrand: '조선호텔',
      endDate,
      scrapedAt: new Date().toISOString()
    };
  });
}

module.exports = { scrapeJosunHotels };
