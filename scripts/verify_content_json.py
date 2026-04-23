"""
축제·맛집 JSON 파일 검증 스크립트
"""
import json
from pathlib import Path
from datetime import datetime

import sys
import io

# Windows 인코딩 대응
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

VALID_REGIONS = ['수도권', '영동권', '부산경남권', '대구경북권', 
                 '광주호남권', '충청권', '제주도']
VALID_CATEGORIES = ['food', 'attraction']

def validate_festivals():
    path = Path('public/data/festivals.json')
    if not path.exists():
        print(f"[FAIL] {path} missing")
        return
        
    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    
    festivals = data['festivals']
    print(f"\n=== festivals.json ({len(festivals)} items) ===")
    
    errors = []
    for f in festivals:
        # 필수 필드 체크
        required = ['id', 'icon', 'name', 'startDate', 'endDate', 
                    'region', 'active']
        for field in required:
            if field not in f:
                errors.append(f"  [Error] {f.get('id', '?')}: {field} missing")
        
        # region 유효성
        if f.get('region') not in VALID_REGIONS:
            errors.append(f"  [Error] {f['id']}: invalid region '{f.get('region')}'")
        
        # 날짜 유효성
        try:
            datetime.strptime(f['startDate'], '%Y-%m-%d')
            datetime.strptime(f['endDate'], '%Y-%m-%d')
        except (ValueError, KeyError):
            errors.append(f"  [Error] {f['id']}: date format error")
    
    if errors:
        for err in errors:
            print(err)
    else:
        print(f"  [OK] All {len(festivals)} items valid")

def validate_attractions():
    path = Path('public/data/attractions.json')
    if not path.exists():
        print(f"[FAIL] {path} missing")
        return

    with open(path, encoding='utf-8') as f:
        data = json.load(f)
    
    attractions = data['attractions']
    print(f"\n=== attractions.json ({len(attractions)} items) ===")
    
    foods = [a for a in attractions if a.get('category') == 'food']
    places = [a for a in attractions if a.get('category') == 'attraction']
    print(f"  - Food: {len(foods)}")
    print(f"  - Attraction: {len(places)}")
    
    errors = []
    for a in attractions:
        required = ['id', 'category', 'icon', 'name', 
                    'address', 'region', 'active']
        for field in required:
            if field not in a:
                errors.append(f"  [Error] {a.get('id', '?')}: {field} missing")
        
        if a.get('category') not in VALID_CATEGORIES:
            errors.append(f"  [Error] {a['id']}: invalid category")
        
        if a.get('region') not in VALID_REGIONS:
            errors.append(f"  [Error] {a['id']}: invalid region")
    
    if errors:
        for err in errors:
            print(err)
    else:
        print(f"  [OK] All {len(attractions)} items valid")

if __name__ == '__main__':
    validate_festivals()
    validate_attractions()
