import csv
import json
import os
import time
import requests
from urllib.parse import quote, urlparse
from urllib.robotparser import RobotFileParser
from bs4 import BeautifulSoup

csv_file_path = 'Hotel_List.csv'
json_file_path = 'Hotel_Data.json'

# User-Agent 설정 (크롤링 윤리 준수)
USER_AGENT = "HotelDocKoreaBot/1.0 (+https://hoteldockorea.com/bot; contact@hoteldockorea.com)"

def can_fetch(url, user_agent=USER_AGENT):
    """
    robots.txt를 확인하여 해당 URL에 접근 가능한지 검사합니다.
    """
    try:
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            return False
            
        robots_url = f"{parsed_url.scheme}://{parsed_url.netloc}/robots.txt"
        rp = RobotFileParser()
        rp.set_url(robots_url)
        rp.read()
        return rp.can_fetch(user_agent, url)
    except Exception:
        # robots.txt 확인 실패 시 기본적으로 허용 (또는 보수적으로 False로 설정 가능)
        return True

def fetch_og_image(url):
    """
    홈페이지 URL에서 Open Graph 메타데이터(og:image)를 추출합니다.
    rate limiting 및 크롤링 윤리를 준수합니다.
    """
    if not url or not url.startswith('http'):
        return None
        
    # 크롤링 전 robots.txt 확인
    if not can_fetch(url):
        print(f"[robots.txt 거부] {url}")
        return None
        
    try:
        # 크롤링 속도 제한 (Rate Limiting): 요청 간 1초 대기
        time.sleep(1)
        
        headers = {'User-Agent': USER_AGENT}
        response = requests.get(url, headers=headers, timeout=5)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        og_image = soup.find('meta', property='og:image')
        
        if og_image and og_image.get('content'):
            return og_image['content']
            
        return None
    except Exception as e:
        print(f"[OG Image 추출 실패 - {url}]: {e}")
        return None
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
            
            # 도시명 + 등급 키워드로 Unsplash 이미지 자동 매핑 (대비책)
            city = row.get('시도', '').strip()
            keyword = RATING_IMAGE_KEYWORDS.get(rating, "hotel")
            encoded_keyword = quote(f"{keyword} korea")
            hotel_name_seed = quote(row.get('이름', 'hotel').strip())
            fallback_image_url = f"https://source.unsplash.com/800x450/?{encoded_keyword}&sig={hotel_name_seed}"
            
            # 공식 홈페이지 URL 확인
            homepage_url = row.get('홈페이지 URL', '').strip()
            
            # 홈페이지에서 OG Image 수집 시도 (실제 메타데이터 인용)
            # 수집 속도가 너무 느려질 경우 아래 로직을 주석 처리하고 크롤링을 별도 스크립트로 분리할 수 있습니다.
            # og_image_url = fetch_og_image(homepage_url) if homepage_url else None
            # image_url = og_image_url if og_image_url else fallback_image_url
            
            # TODO: 실 서비스 적용 시 주석 해제 및 사용
            image_url = fallback_image_url
                
            hotel_info = {
                "시도": city,
                "세부지역": row.get('세부 지역(시·군·구)', '').strip(),
                "이름": row.get('이름', '').strip(),
                "업종": row.get('업종', '').strip(),
                "객실수": row.get('객실수', '').strip(),
                "전화번호": row.get('전화번호', '').strip(),
                "주소": row.get('주소', '').strip(),
                "홈페이지": homepage_url,
                "예약페이지": row.get('예약/프로모션 페이지', '').strip(),
                "imageUrl": image_url,  # 호텔 대표 이미지 (Open Graph 연동 구조)
            }
            data[region][rating].append(hotel_info)

    with open(json_file_path, mode='w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print("SUCCESS: JSON file created successfully with imageUrl fields.")
except Exception as e:
    print(f"ERROR: {e}")

