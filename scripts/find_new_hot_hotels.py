import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')

def find_exact_names():
    with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
        data = json.load(f)

    hotels_flat = []
    for region in data.values():
        for grade in region.values():
            hotels_flat.extend(grade)

    search_targets = ['조선팰리스', '인터컨티넨탈 서울 파르나스', '소노캄 고양', '그랜드 조선 부산']
    
    print(f"{'Search Keyword':<20} | {'Exact Name in Data':<50} | {'Region':<10} | {'Image'}")
    print("-" * 100)
    
    for target in search_targets:
        found = [h for h in hotels_flat if target.replace(' ', '') in h.get('이름', '').replace(' ', '')]
        if found:
            # Sort by name length to find the most probable match (or often the first one if exact)
            h = found[0]
            name = h.get('이름')
            region = h.get('region', 'N/A')
            img = h.get('imageUrl', '')
            has_img = 'Yes' if img else 'No'
            print(f"{target:<20} | {name:<50} | {region:<10} | {has_img}")
        else:
            print(f"{target:<20} | {'NOT FOUND':<50} | {'-':<10} | -")

if __name__ == "__main__":
    find_exact_names()
