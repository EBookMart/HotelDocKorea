
import os
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path('.env'))
TOUR_API_KEY = os.getenv('TOUR_API_KEY')
ENDPOINT = "https://apis.data.go.kr/B551011/KorService2/searchKeyword2"

def test_api():
    params = {
        'serviceKey': TOUR_API_KEY,
        'numOfRows': 5,
        'pageNo': 1,
        'MobileOS': 'ETC',
        'MobileApp': 'Test',
        '_type': 'json',
        'keyword': '롯데호텔',
        'contentTypeId': 32,
    }
    res = requests.get(ENDPOINT, params=params)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        try:
            data = res.json()
            print(json.dumps(data, indent=2, ensure_ascii=False))
        except:
            print(res.text)
    else:
        print(f"Body: {res.text}")

import json
test_api()
