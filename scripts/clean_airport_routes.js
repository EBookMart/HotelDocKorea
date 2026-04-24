const fs = require('fs');
const path = require('path');

// Paths
const hotelsPath = path.join(__dirname, '../public/data/hotels.json');
const routesPath = path.join(__dirname, '../public/data/airport-routes.json');

// Load data
const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));
const routes = JSON.parse(fs.readFileSync(routesPath, 'utf8'));

// Extract Capital Region hotel names
const capitalRegionHotels = new Set();
if (hotels['수도권']) {
  for (const grade in hotels['수도권']) {
    hotels['수도권'][grade].forEach(h => {
      capitalRegionHotels.add(h.이름);
    });
  }
}

console.log(`Capital Region Hotels found in hotels.json: ${capitalRegionHotels.size}`);

// Cleanup fake data
const cleanedRoutes = {};
let removedCount = 0;
let keptCount = 0;

for (const hotelName in routes) {
  if (capitalRegionHotels.has(hotelName)) {
    cleanedRoutes[hotelName] = routes[hotelName];
    keptCount++;
  } else {
    removedCount++;
  }
}

console.log(`Kept (Capital Region): ${keptCount}`);
console.log(`Removed (Regional - Fake Data): ${removedCount}`);

// Save
fs.writeFileSync(
  routesPath,
  JSON.stringify(cleanedRoutes, null, 2),
  'utf8'
);

console.log('✅ Cleanup complete: airport-routes.json updated.');
