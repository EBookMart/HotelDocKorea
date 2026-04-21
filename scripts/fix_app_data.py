import json
import os
from pathlib import Path

SOURCE_HOTELS_PATH = Path('public/data/hotels.json')
MATCH_RESULTS_PATH = Path('scripts/test_results/phase_3a_2_full_results.json')
BACKUP_PATH = Path('public/data/hotels_backup_before_fixing.json')

def main():
    print("=== App Data Correction & Integration Starting ===")
    
    # 1. 백업
    if not SOURCE_HOTELS_PATH.exists():
        print(f"Error: {SOURCE_HOTELS_PATH} not found")
        return
    
    import shutil
    shutil.copy2(SOURCE_HOTELS_PATH, BACKUP_PATH)
    print(f"Backup created at {BACKUP_PATH}")

    # 2. 로드
    with open(SOURCE_HOTELS_PATH, 'r', encoding='utf-8') as f:
        hotels = json.load(f)
    with open(MATCH_RESULTS_PATH, 'r', encoding='utf-8') as f:
        matches = json.load(f)

    # 매칭 맵 만들기
    match_map = {m['_index']: m for m in matches if m.get('matched')}
    print(f"Loaded {len(match_map)} matches")

    # 3. 데이터 변환 및 통합
    integrated_count = 0
    current_index = 0
    
    # 광주호남권 키 변경 (존재하면)
    if '광주호남(전남, 전북)권' in hotels:
        hotels['광주호남권'] = hotels.pop('광주호남(전남, 전북)권')
        print("Renamed '광주호남(전남, 전북)권' to '광주호남권'")

    # 순회하며 필드 업데이트
    for region_name, grades in hotels.items():
        for grade_name, hotel_list in grades.items():
            for hotel in hotel_list:
                if current_index in match_map:
                    m = match_map[current_index]
                    hotel['tourApiMatched'] = True
                    hotel['imageUrl'] = m.get('first_image', '')
                    hotel['mapx'] = m.get('mapx', '')
                    hotel['mapy'] = m.get('mapy', '')
                    hotel['tourApiTitle'] = m.get('matched_title', '')
                    hotel['tourApiAddress'] = m.get('matched_addr', '')
                    integrated_count += 1
                else:
                    hotel['tourApiMatched'] = False
                current_index += 1

    # 4. 저장
    with open(SOURCE_HOTELS_PATH, 'w', encoding='utf-8') as f:
        json.dump(hotels, f, ensure_ascii=False, indent=2)
    
    print(f"Integration complete. Total hotels: {current_index}, Matched: {integrated_count}")

if __name__ == "__main__":
    main()
