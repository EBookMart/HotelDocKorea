import csv
import json
import os

csv_file_path = 'Hotel_List.csv'
json_file_path = 'Hotel_Data.json'

data = {}

try:
    with open(csv_file_path, mode='r', encoding='utf-8-sig') as f:
        reader = csv.DictReader(f)
        for row in reader:
            region = row.get('권역')
            rating = row.get('등급')
            
            if not region or not rating:
                continue
                
            if region not in data:
                data[region] = {}
                
            if rating not in data[region]:
                data[region][rating] = []
                
            hotel_info = {
                "시도": row.get('시도', '').strip(),
                "세부지역": row.get('세부 지역(시·군·구)', '').strip(),
                "이름": row.get('이름', '').strip(),
                "업종": row.get('업종', '').strip(),
                "객실수": row.get('객실수', '').strip(),
                "전화번호": row.get('전화번호', '').strip(),
                "주소": row.get('주소', '').strip(),
                "홈페이지": row.get('홈페이지 URL', '').strip(),
                "예약페이지": row.get('예약/프로모션 페이지', '').strip()
            }
            data[region][rating].append(hotel_info)

    with open(json_file_path, mode='w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("SUCCESS: JSON file created successfully.")
except Exception as e:
    print(f"ERROR: {e}")
