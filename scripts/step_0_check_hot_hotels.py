import json
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')

def check_hot_hotels():
    if not SOURCE_HOTELS_PATH.exists():
        print(f"Error: {SOURCE_HOTELS_PATH} not found")
        return

    with open(SOURCE_HOTELS_PATH, encoding='utf-8') as f:
        data = json.load(f)

    hotels_flat = []
    for region in data.values():
        for grade in region.values():
            hotels_flat.extend(grade)

    targets = ['시그니엘', '파라다이스시티', '롯데호텔 제주', '그랜드 조선 부산']
    results = []
    
    print("=== Step 0: 4개 HOT 호텔 데이터 상태 확인 ===")
    for target in targets:
        # 공백 제거 후 비교 (유연한 매칭)
        found = [h for h in hotels_flat if target.replace(' ', '') in h.get('이름', '').replace(' ', '')]
        if found:
            h = found[0]
            name = h.get('이름', 'N/A')
            matched = h.get('tourApiMatched', False)
            img = h.get('imageUrl', '')
            img_status = '있음' if img else '(없음)'
            
            print(f'검색: {target}')
            print(f'  실제 이름: {name}')
            print(f'  TourAPI 매칭: {matched}')
            print(f'  이미지 URL: {img_status}')
            if img:
                print(f'  URL 일부: {img[:70]}...')
            print()
            results.append({'target': target, 'found': True, 'has_img': bool(img)})
        else:
            print(f'검색: {target} - 데이터에서 찾을 수 없음')
            print()
            results.append({'target': target, 'found': False, 'has_img': False})
    
    # 시나리오 판단
    found_count = sum(1 for r in results if r['found'])
    img_count = sum(1 for r in results if r['has_img'])
    
    if img_count == len(targets):
        print("결과: 시나리오 A (모두 이미지 있음)")
    elif img_count > 0:
        print(f"결과: 시나리오 B (일부 이미지 있음: {img_count}/{len(targets)})")
    else:
        print("결과: 시나리오 C (이미지 없음)")

if __name__ == "__main__":
    check_hot_hotels()
