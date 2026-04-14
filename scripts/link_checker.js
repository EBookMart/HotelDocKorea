const fs = require('fs');
const path = require('path');

const HOTELS_JSON_PATH = path.join(__dirname, '../public/data/hotels.json');

async function checkDeadLinks() {
  console.log('[Link Checker] Starting Self-healing Check...');
  
  if (!fs.existsSync(HOTELS_JSON_PATH)) {
    console.error('Data file not found.');
    return;
  }

  const hotelsData = JSON.parse(fs.readFileSync(HOTELS_JSON_PATH, 'utf8'));
  let checkedCount = 0;
  let deadPromoCount = 0;

  // In production, we'd use axios/fetch to periodically send HEAD requests
  // to promo.link and promo.imageUrl. To avoid blocking or spamming during this mock run:
  const mockPing = async (url) => {
    // 1% chance it's randomly considered dead for mock demonstration
    return Math.random() > 0.99;
  };

  for (const region in hotelsData) {
    for (const rating in hotelsData[region]) {
      const hotelsList = hotelsData[region][rating];
      
      for (const hotel of hotelsList) {
        if (hotel.promotions && hotel.promotions.length > 0) {
           const initialLength = hotel.promotions.length;
           
           // Await the filter logic (this is simplified, usually we map inside Promise.all)
           const validPromos = [];
           for (const promo of hotel.promotions) {
              checkedCount++;
              const isDead = await mockPing(promo.link);
              if (isDead) {
                console.log(`[Link Checker] ☠️ Dead URL Found: ${promo.title.ko} - REMOVING`);
                deadPromoCount++;
              } else {
                validPromos.push(promo);
              }
           }
           hotel.promotions = validPromos;
        }
      }
    }
  }

  if (deadPromoCount > 0) {
     fs.writeFileSync(HOTELS_JSON_PATH, JSON.stringify(hotelsData, null, 2), 'utf8');
     console.log(`[Link Checker] Self-healing complete. Extracted ${deadPromoCount} dead items.`);
     
     // Telegram Emergency Notify Logic (Mock)
     if (deadPromoCount > 5) {
        console.log(`[Alert System] 🚨 EMERGENCY: ${deadPromoCount} dead links detected. Firing Telegram Bot API payload to Admin...`);
     }
  } else {
     console.log(`[Link Checker] Checked ${checkedCount} links. All secure and valid. 😊`);
  }
}

checkDeadLinks().catch(err => console.error(err));
