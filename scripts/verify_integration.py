import json
try:
    with open('Hotel_Data.json', encoding='utf-8') as f:
        data = json.load(f)

    # 통계 (중첩 구조 반영)
    hotels_flat = []
    for region in data.values():
        for grade in region.values():
            hotels_flat.extend(grade)

    matched = sum(1 for h in hotels_flat if h.get('tourApiMatched'))
    # Unsplash 이미지가 아닌 실제 TourAPI 이미지가 들어있는지 확인
    with_image = sum(1 for h in hotels_flat if h.get('imageUrl') and not h.get('imageUrl', '').startswith('https://source.unsplash.com'))
    with_mapx = sum(1 for h in hotels_flat if h.get('mapx'))

    print(f'전체 호텔: {len(hotels_flat)}')
    print(f'TourAPI 매칭: {matched}')
    print(f'이미지 URL 있음 (TourAPI 원본): {with_image}')
    print(f'좌표 있음: {with_mapx}')

    # 샘플 확인
    matched_samples = [h for h in hotels_flat if h.get('tourApiMatched') and h.get('imageUrl')][:3]
    print('\n=== 매칭된 호텔 샘플 3개 ===')
    for h in matched_samples:
        print(f"- {h.get('이름', 'N/A')}")
        print(f"  이미지: {h.get('imageUrl', '')[:60]}...")
        print(f"  좌표: {h.get('mapx')}, {h.get('mapy')}")
except Exception as e:
    print(f"Error during verification: {e}")
