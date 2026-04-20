"""
Phase 3A 진단 스크립트
실패한 4개 호텔이 TourAPI에 어떤 이름으로 등록되어 있는지 직접 검색
"""
import os
import time
from pathlib import Path
from typing import List, Dict, Any

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')

TOUR_API_KEY = os.getenv('TOUR_API_KEY')
TOUR_API_ENDPOINT = os.getenv(
    'TOUR_API_ENDPOINT_KO',
    'https://apis.data.go.kr/B551011/KorService2'
)

# 실패한 4개 호텔 + 이들에 대해 시도해볼 다양한 검색어
TEST_CASES = {
    "조선팰리스강남": [
        "조선팰리스",
        "조선 팰리스",
        "조선 팰리스 서울",
        "조선 팰리스 강남",
        "Josun Palace",
        "조선호텔",
        "강남 조선",
        "팰리스 강남",
    ],
    "파크하얏트서울": [
        "파크하얏트",
        "파크 하얏트",
        "파크하얏트 서울",
        "파크 하얏트 서울",
        "Park Hyatt",
        "Park Hyatt Seoul",
        "하얏트 삼성",
        "삼성 하얏트",
    ],
    "호텔 오크우드프리미어": [
        "오크우드",
        "오크우드 프리미어",
        "오크우드프리미어",
        "Oakwood",
        "Oakwood Premier",
        "오크우드 코엑스",
        "오크우드 삼성",
    ],
    "인터컨티넨탈 서울 코엑스": [
        "인터컨티넨탈 코엑스",
        "인터컨티넨탈",
        "코엑스 인터컨티넨탈",
        "InterContinental Coex",
        "InterContinental",
        "코엑스",
        "삼성동 인터컨티넨탈",
    ],
}


def search_tourapi(keyword: str, content_type_id: int = 32) -> List[Dict[str, Any]]:
    """TourAPI searchKeyword2 호출"""
    params = {
        'serviceKey': TOUR_API_KEY,
        'numOfRows': 5,
        'pageNo': 1,
        'MobileOS': 'ETC',
        'MobileApp': 'HotelDocKorea',
        '_type': 'json',
        'keyword': keyword,
        'contentTypeId': content_type_id,
        'arrange': 'A',
    }

    url = f"{TOUR_API_ENDPOINT}/searchKeyword2"

    try:
        response = requests.get(url, params=params, timeout=15)
        response.raise_for_status()
        data = response.json()

        body = data.get('response', {}).get('body', {})
        items = body.get('items', {})

        if not items or items == '':
            return []

        item_list = items.get('item', [])
        if isinstance(item_list, dict):
            item_list = [item_list]
        return item_list
    except Exception as e:
        return [{'error': str(e)}]


def diagnose():
    """4개 호텔에 대해 모든 검색어 시도"""
    print("=" * 70)
    print("Phase 3A 진단: 실패 호텔의 TourAPI 등록 상태 확인")
    print("=" * 70)

    found_any = {}

    for hotel_name, test_keywords in TEST_CASES.items():
        print(f"\n[호텔: {hotel_name}]")
        print("-" * 70)

        found_any[hotel_name] = []

        # contentTypeId=32 (숙박) 로 검색
        print("  * 숙박 카테고리(contentTypeId=32) 검색")
        for kw in test_keywords:
            results = search_tourapi(kw, content_type_id=32)
            time.sleep(0.3)

            if results and 'error' not in results[0]:
                print(f"    '{kw}' -> {len(results)}건 발견:")
                for r in results[:3]:
                    title = r.get('title', '?')
                    addr = r.get('addr1', '?')
                    cid = r.get('contentid', '?')
                    addr_short = addr[:35] + '...' if len(addr) > 35 else addr
                    print(f"      - [{cid}] {title} ({addr_short})")
                    found_any[hotel_name].append({
                        'keyword': kw,
                        'contentTypeId': 32,
                        'title': title,
                        'contentid': cid,
                        'address': addr,
                    })
            else:
                print(f"    '{kw}' -> 0건")

        # contentTypeId 제거해서 전체 카테고리 검색
        print("  * 전체 카테고리 검색 (contentTypeId 제거)")
        for kw in test_keywords[:3]:
            params_no_type = {
                'serviceKey': TOUR_API_KEY,
                'numOfRows': 5,
                'pageNo': 1,
                'MobileOS': 'ETC',
                'MobileApp': 'HotelDocKorea',
                '_type': 'json',
                'keyword': kw,
                'arrange': 'A',
            }
            url = f"{TOUR_API_ENDPOINT}/searchKeyword2"

            try:
                response = requests.get(url, params=params_no_type, timeout=15)
                data = response.json()
                body = data.get('response', {}).get('body', {})
                items = body.get('items', {})

                if items and items != '':
                    item_list = items.get('item', [])
                    if isinstance(item_list, dict):
                        item_list = [item_list]

                    if item_list:
                        print(f"    '{kw}' (전체 카테고리) -> {len(item_list)}건:")
                        for r in item_list[:3]:
                            title = r.get('title', '?')
                            ct = r.get('contenttypeid', '?')
                            cid = r.get('contentid', '?')
                            print(f"      - [{cid}] type={ct} {title}")
                    else:
                        print(f"    '{kw}' (전체 카테고리) -> 0건")
                else:
                    print(f"    '{kw}' (전체 카테고리) -> 0건")
            except Exception as e:
                print(f"    '{kw}' 에러: {e}")

            time.sleep(0.3)

    # 요약
    print("\n" + "=" * 70)
    print("진단 요약")
    print("=" * 70)
    for hotel_name, findings in found_any.items():
        if findings:
            unique_titles = list({f['title'] for f in findings})
            print(f"\n  [{hotel_name}]: 등록 확인됨 ({len(findings)}건)")
            for title in unique_titles[:3]:
                cid = next(f['contentid'] for f in findings if f['title'] == title)
                print(f"    -> [{cid}] {title}")
            print(f"    => fallback 로직 개선으로 매칭 가능")
        else:
            print(f"\n  [{hotel_name}]: TourAPI 등록 안됨 (또는 전혀 다른 이름)")
            print(f"    => 수동 매핑 또는 다른 데이터 소스 필요")


if __name__ == '__main__':
    diagnose()
