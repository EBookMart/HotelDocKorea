import csv
import json
import os
from urllib.parse import quote

csv_file_path = 'Hotel_List.csv'
json_file_path = 'Hotel_Data.json'

# 등급별 Unsplash 플레이스홀더 이미지 키워드
# source.unsplash.com은 무료 API로 키워드 기반 고화질 호텔 사진 제공
RATING_IMAGE_KEYWORDS = {
    "5성": "luxury hotel lobby",
    "4성": "modern hotel interior",
    "3성": "hotel room comfortable",
}

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
            
            # 도시명 + 등급 키워드로 Unsplash 이미지 자동 매핑
            city = row.get('시도', '').strip()
            keyword = RATING_IMAGE_KEYWORDS.get(rating, "hotel")
            encoded_keyword = quote(f"{keyword} korea")
            # 800x450 = 16:9 비율 / seed=호텔이름으로 같은 호텔은 항상 같은 이미지
            hotel_name_seed = quote(row.get('이름', 'hotel').strip())
            image_url = f"https://source.unsplash.com/800x450/?{encoded_keyword}&sig={hotel_name_seed}"
                
            hotel_info = {
                "시도": city,
                "세부지역": row.get('세부 지역(시·군·구)', '').strip(),
                "이름": row.get('이름', '').strip(),
                "업종": row.get('업종', '').strip(),
                "객실수": row.get('객실수', '').strip(),
                "전화번호": row.get('전화번호', '').strip(),
                "주소": row.get('주소', '').strip(),
                "홈페이지": row.get('홈페이지 URL', '').strip(),
                "예약페이지": row.get('예약/프로모션 페이지', '').strip(),
                "imageUrl": image_url,  # 호텔 대표 이미지 (Unsplash 자동 매핑)
            }
            data[region][rating].append(hotel_info)

    with open(json_file_path, mode='w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("SUCCESS: JSON file created successfully with imageUrl fields.")
except Exception as e:
    print(f"ERROR: {e}")

