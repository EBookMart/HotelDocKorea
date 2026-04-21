import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')

with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
    data = json.load(f)

hotels_flat = []
for region in data.values():
    for grade in region.values():
        hotels_flat.extend(grade)

targets = ['시그니엘 서울', '파라다이스시티', '롯데호텔 제주', '그랜드 조선 부산']
for target in targets:
    found = [h for h in hotels_flat if target in h.get('이름', '')]
    if found:
        h = found[0]
        print(f'{target}:')
        print(f'  매칭: {h.get("tourApiMatched", False)}')
        print(f'  imageUrl: {h.get("imageUrl", "")[:80] if h.get("imageUrl") else "(None)"}')
    else:
        print(f'{target}: Not found')
    print()
