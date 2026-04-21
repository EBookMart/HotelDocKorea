"""
Phase 3A-3: TourAPI 매칭 결과를 Hotel_Data.json에 통합
- 매칭 성공한 199개 호텔에 TourAPI 필드 추가
- 매칭 실패한 321개 호텔은 기존 구조 유지
- 원본 데이터 손상 없이 안전하게 통합
"""

import json
from pathlib import Path
from datetime import datetime

HOTEL_DATA_PATH = Path('Hotel_Data.json')
MATCHING_RESULTS_PATH = Path('scripts/test_results/phase_3a_2_full_results.json')
OUTPUT_PATH = Path('Hotel_Data.json')  # 원본 덮어쓰기 (백업 있음)

def main():
    print("="*60)
    print("Phase 3A-3: Hotel_Data.json 통합 작업")
    print("="*60)
    
    # 1. 원본 Hotel_Data.json 로드
    print("\n[1/5] 원본 데이터 로드...")
    with open(HOTEL_DATA_PATH, encoding='utf-8') as f:
        hotels = json.load(f)
    print(f"  → {len(hotels)}개 호텔 로드 완료")
    
    # 2. 매칭 결과 로드
    print("\n[2/5] 매칭 결과 로드...")
    with open(MATCHING_RESULTS_PATH, encoding='utf-8') as f:
        results = json.load(f)  # 리스트 형태임
    
    matched_results = [r for r in results if r.get('matched')]
    print(f"  → {len(results)}개 결과 중 {len(matched_results)}개 매칭 성공")
    
    # 3. 매칭 결과를 index로 매핑
    print("\n[3/5] 매칭 맵 생성...")
    match_map = {}
    for r in results:
        if r.get('matched'):
            idx = r.get('_index')  # 필드명이 _index 임
            match_map[idx] = r
    print(f"  → {len(match_map)}개 호텔 TourAPI 데이터 준비")
    
    # 4. 통합 처리
    print("\n[4/5] 데이터 통합 중...")
    integrated_count = 0
    current_index = 0
    
    # Hotel_Data.json은 {권역: {등급: [호텔리스트]}} 구조입니다.
    for region_name, grades in hotels.items():
        for grade_name, hotel_list in grades.items():
            for hotel in hotel_list:
                if current_index in match_map:
                    tour_data = match_map[current_index]
                    hotel['tourApiMatched'] = True
                    hotel['contentId'] = tour_data.get('content_id', '')
                    hotel['imageUrl'] = tour_data.get('first_image', '')
                    hotel['imageUrl2'] = tour_data.get('first_image2', '')
                    hotel['mapx'] = tour_data.get('mapx', '')
                    hotel['mapy'] = tour_data.get('mapy', '')
                    hotel['tourApiTitle'] = tour_data.get('matched_title', '')
                    hotel['tourApiAddress'] = tour_data.get('matched_addr', '')
                    hotel['tourApiAreaCode'] = tour_data.get('_region', '')
                    integrated_count += 1
                else:
                    hotel['tourApiMatched'] = False
                current_index += 1
                
    print(f"  → {integrated_count}개 호텔 통합 완료")
    
    # 5. 저장
    print("\n[5/5] Hotel_Data.json 저장...")
    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(hotels, f, ensure_ascii=False, indent=2)
    
    file_size_kb = OUTPUT_PATH.stat().st_size / 1024
    print(f"  → 저장 완료 ({file_size_kb:.1f} KB)")
    
    # 결과 리포트
    print("\n" + "="*60)
    print("Phase 3A-3 완료!")
    print("="*60)
    print(f"전체 호텔:         {len(hotels)}개")
    print(f"TourAPI 매칭:     {integrated_count}개 ({integrated_count/len(hotels)*100:.1f}%)")
    print(f"매칭 안 됨:        {len(hotels) - integrated_count}개")
    print(f"\n백업 파일: Hotel_Data_backup_before_phase_3a_3.json")
    print(f"통합 완료: Hotel_Data.json")
    print("="*60)

if __name__ == '__main__':
    main()
