
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path('.env'))
TOUR_API_KEY = os.getenv('TOUR_API_KEY')
ENDPOINT = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2"

def search(keyword):
    params = {
        'serviceKey': TOUR_API_KEY,
        'numOfRows': 10,
        'pageNo': 1,
        'MobileOS': 'ETC',
        'MobileApp': 'Test',
        '_type': 'json',
        'keyword': keyword,
        'contentTypeId': 32,
    }
    res = requests.get(ENDPOINT, params=params)
    print(f"Keyword: {keyword}")
    if res.status_code == 200:
        data = res.json()
        items = data.get('response', {}).get('body', {}).get('items', {})
        if items and items != '':
            for item in items.get('item', []):
                print(f"  - {item.get('title')} ({item.get('addr1')}) [ID: {item.get('contentid')}]")
        else:
            print("  No items found.")
    else:
        print(f"  Error: {res.status_code}")

search("롯데호텔월드")
search("롯데 호텔 월드")
search("메이필드")
search("그랜드 워커힐")
search("소피텔 앰배서더")
search("인터컨티넨탈")
