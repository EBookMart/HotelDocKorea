import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')

with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
    data = json.load(f)

hotels_flat = []
for region in data.values():
    for grade in region.values():
        hotels_flat.extend(grade)

targets = ['시그니엘 서울', '파라다이스시티', '롯데호텔 제주', '그랜드 조선 부산', '라까사 호텔 서울']
for t in targets:
    found = [h for h in hotels_flat if t == h.get('이름')]
    if found:
        h = found[0]
        print(f'{t}: Found | Matched: {h.get("tourApiMatched")} | imageUrl: {h.get("imageUrl", "None")[:60]}')
    else:
        partial = [h.get('이름') for h in hotels_flat if t.replace(' ', '') in h.get('이름', '').replace(' ', '')]
        print(f'{t}: Not exact match. Partial: {partial}')
