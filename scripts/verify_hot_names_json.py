import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')
with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
    data = json.load(f)

hotels_flat = []
for region_name, grades in data.items():
    for grade_name, hotel_list in grades.items():
        for h in hotel_list:
            h['region_key'] = region_name
            hotels_flat.append(h)

search_targets = ['조선팰리스강남', '그랜드 인터컨티넨탈 서울 파르나스', '소노캄 고양', '그랜드 조선 부산']
output = []
for target in search_targets:
    results = [h for h in hotels_flat if target.replace(' ', '') == h.get('이름', '').replace(' ', '')]
    if results:
        h = results[0]
        output.append({
            'target': target,
            'exact_name': h['이름'],
            'region': h['region_key'],
            'has_img': bool(h.get('imageUrl'))
        })
    else:
        output.append({'target': target, 'exact_name': 'NOT FOUND'})

with open('scratch/exact_names_report.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
