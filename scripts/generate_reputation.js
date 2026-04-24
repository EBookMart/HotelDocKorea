const fs = require('fs');
const path = require('path');

const HOTELS_PATH = path.join(__dirname, '..', 'public', 'data', 'hotels.json');
const OUTPUT_PATH = path.join(__dirname, '..', 'public', 'data', 'reputation.json');

function generateReputation() {
  const data = JSON.parse(fs.readFileSync(HOTELS_PATH, 'utf8'));
  const reputation = {};
  
  const hotels = [];
  Object.keys(data).forEach(region => {
    Object.keys(data[region]).forEach(grade => {
      data[region][grade].forEach(h => {
        // Simulated Google Places Data
        const rating = Math.round((3.8 + Math.random() * 1.1) * 10) / 10;
        const reviewCount = Math.floor(Math.random() * 2000) + 10;
        hotels.push({ name: h.이름, rating, reviewCount });
      });
    });
  });

  // Calculate Global Stats for Bayesian
  const m = hotels.reduce((acc, h) => acc + h.rating, 0) / hotels.length;
  const C = hotels.reduce((acc, h) => acc + h.reviewCount, 0) / hotels.length;

  console.log(`Global Avg Rating (m): ${m.toFixed(2)}`);
  console.log(`Global Avg Reviews (C): ${C.toFixed(2)}`);

  hotels.forEach(h => {
    const R = h.reviewCount;
    const v = h.rating;
    
    // Bayesian Formula: W = (R*v + C*m) / (R + C)
    const weightedScore = (R * v + C * m) / (R + C);
    
    reputation[h.name] = {
      originalRating: v,
      reviewCount: R,
      weightedScore: weightedScore,
      updatedAt: new Date().toISOString()
    };
  });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(reputation, null, 2));
  console.log(`Successfully generated reputation data for ${hotels.length} hotels.`);
}

generateReputation();
