import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')

with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
    data = json.load(f)

hotels_flat = []
for region in data.values():
    for grade in region.values():
        hotels_flat.extend(grade)

search_keywords = ['시그니엘', '파라다이스', '제주', '조선']
print(f"{'이름':<30} | {'Matched':<8} | {'imageUrl'}")
print("-" * 80)
for h in hotels_flat:
    name = h.get('이름', '')
    if any(k in name for k in search_keywords):
        matched = h.get('tourApiMatched', False)
        img = h.get('imageUrl', 'None')
        print(f"{name:<30} | {str(matched):<8} | {img[:50]}")
