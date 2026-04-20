# -*- coding: utf-8 -*-
"""
제주도 호텔 TourAPI 진단 스크립트
제주도 호텔의 매칭 실패 원인을 파악합니다.
"""

import os
import time
import json
from pathlib import Path
import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')

key = os.getenv('TOUR_API_KEY')
url = 'https://apis.data.go.kr/B551011/KorService2/searchKeyword2'

if not key:
    print("[오류] .env 파일에 TOUR_API_KEY가 없습니다!")
    exit(1)

# Hotel_Data.json에서 제주도 호텔 추출
with open(PROJECT_ROOT / 'Hotel_Data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

jeju_hotels = []
if isinstance(data, dict):
    # 제주도 또는 제주 키로 검색
    for key_name in ['제주도', '제주', 'jeju', 'Jeju']:
        jeju_data = data.get(key_name, {})
        if isinstance(jeju_data, dict):
            for grade, hotels in jeju_data.items():
                if isinstance(hotels, list):
                    jeju_hotels.extend(hotels)
            if jeju_hotels:
                print(f"[발견] '{key_name}' 키에서 {len(jeju_hotels)}개 호텔 발견")
                break
        elif isinstance(jeju_data, list):
            jeju_hotels.extend(jeju_data)
            print(f"[발견] '{key_name}' 키에서 {len(jeju_hotels)}개 호텔 발견")
            break

if not jeju_hotels:
    print("[주의] 제주도 호텔이 없습니다. 사용 가능한 지역 키 목록:")
    if isinstance(data, dict):
        for k in list(data.keys())[:20]:
            print(f"  - {k}")
    exit(0)

print(f"\n제주도 테스트 샘플: 총 {len(jeju_hotels)}개 중 앞 5개 테스트")
print("=" * 60)

def search_keyword(keyword, api_key):
    """키워드로 TourAPI 검색"""
    params = {
        'serviceKey': api_key,
        'numOfRows': 5,
        'pageNo': 1,
        'MobileOS': 'ETC',
        'MobileApp': 'HotelDocKorea',
        '_type': 'json',
        'keyword': keyword,
        'contentTypeId': 32,  # 숙박 카테고리
        'arrange': 'A',
    }
    try:
        r = requests.get(url, params=params, timeout=15)
        if r.status_code == 429:
            return None, "429 Rate Limit"
        r.raise_for_status()
        resp_data = r.json()
        body = resp_data.get('response', {}).get('body', {})
        items = body.get('items', {})
        total_count = body.get('totalCount', 0)
        count = 0
        titles = []
        if items and items != '':
            item_list = items.get('item', [])
            if isinstance(item_list, dict):
                item_list = [item_list]
            count = len(item_list)
            titles = [
                f"{i.get('title', '?')[:25]} ({i.get('addr1', '?')[:15]})"
                for i in item_list
            ]
        return count, {'total': total_count, 'titles': titles}
    except Exception as e:
        return None, f"에러: {e}"

# API KEY 마스킹 (보안)
masked_key = key[:8] + '...' + key[-4:] if len(key) > 12 else '****'
print(f"API 키: {masked_key}")
print()

for h in jeju_hotels[:5]:
    name = h.get('name') or h.get('hotelName', '이름없음')
    addr = h.get('address') or h.get('주소', '주소없음')

    print(f"[ 호텔명: {name} ]")
    print(f"  주소: {addr}")

    # 다양한 검색어 시도
    search_terms = []

    # 1) 원본 이름
    search_terms.append(('원본', name))

    # 2) 공백으로 분리해서 첫 단어
    parts = name.split()
    if len(parts) > 1:
        search_terms.append(('첫단어', parts[0]))

    # 3) 법인 접두사 제거 (주)/(재)/(사) 등
    import re
    cleaned = re.sub(r'^\([주재사합]\)', '', name).strip()
    cleaned = re.sub(r'^(주식회사|유한회사|재단법인|사단법인)\s*', '', cleaned).strip()
    if cleaned != name:
        search_terms.append(('법인제거', cleaned))

    # 4) 앞 4글자
    if len(name) > 4:
        search_terms.append(('앞4자', name[:4]))

    # 5) '호텔' 제거
    no_hotel = re.sub(r'호텔|HOTEL|Hotel', '', name).strip()
    if no_hotel and no_hotel != name:
        search_terms.append(('호텔제거', no_hotel))

    rate_limited = False
    for label, kw in search_terms:
        if rate_limited:
            break
        count, result = search_keyword(kw, key)
        if count is None:
            if '429' in str(result):
                print(f"|   [{label}] '{kw}' -> [429] {result}")
                rate_limited = True
            else:
                print(f"|   [{label}] '{kw}' -> [ERR] {result}")
        else:
            total = result.get('total', 0)
            titles = result.get('titles', [])
            status = "[OK]" if count > 0 else "[0건]"
            print(f"|   [{label}] '{kw}' -> {status} {count}건 (API 총 {total}건)")
            for t in titles[:3]:
                print(f"|            +-- {t}")
        time.sleep(1.2)

    print("-" * 52)
    print()

print("=" * 60)
print("[진단 완료]")
print()
print("판단 기준:")
print("  (A) 검색 결과 있음 → 알고리즘 개선으로 해결 가능")
print("  (B) 모든 검색 0건  → TourAPI 미등록 (수용 필요)")
print("  (C) 429 발생       → 딜레이 증가 필요")
