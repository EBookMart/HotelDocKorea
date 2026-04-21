import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')
with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
    data = json.load(f)

hotels_flat = []
for region in data.values():
    for grade in region.values():
        hotels_flat.extend(grade)

search_keywords = ['시그니엘', '파라다이스시티', '롯데호텔 제주', '그랜드 조선 부산', '라까사']
print(f"{'Data Name':<40} | {'Matched':<8} | {'imageUrl'}")
print("-" * 100)
for h in hotels_flat:
    name = h.get('이름', '')
    if any(k in name for k in search_keywords):
        print(f"{name:<40} | {str(h.get('tourApiMatched')):<8} | {h.get('imageUrl', 'None')[:50]}")
