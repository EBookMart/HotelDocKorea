const puppeteer = require('puppeteer');
const crypto = require('crypto');

async function scrapeShillaHotels() {
  console.log('[Scraper] Starting Shilla Hotels Promotion Scraper...');
  // Mock logic replicating the scraper engine
  // In production, this targets www.shillahotels.com/offers
  
  const promos = [
    {
      title: "어번 아일랜드 문라이트 요가 (수영장 포함)",
      imageUrl: "https://www.shillahotels.com/images/eno/sub/prom/2024/03/yoga.jpg",
      period: "2024.04.01 - 2024.08.30",
      link: "https://www.shillahotels.com/offers/yoga",
      category: "체험/액티비티"
    },
    {
      title: "Stay & Dine in Excellence (투숙객 조식 뷔페 특가)",
      imageUrl: "https://www.shillahotels.com/images/eno/sub/prom/2024/03/dine.jpg",
      period: "2024.03.01 - 2024.12.31",
      link: "https://www.shillahotels.com/offers/dine",
      category: "다이닝/조식"
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
      hotelBrand: '신라호텔',
      endDate,
      scrapedAt: new Date().toISOString()
    };
  });
}

module.exports = { scrapeShillaHotels };
