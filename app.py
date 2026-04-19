from flask import Flask, render_template, jsonify
import json
import os

app = Flask(__name__)

# 데이터 파일 경로 설정 (D: 드라이브 경로 확인)
DATA_FILE = 'Hotel_Data.json'

@app.route('/')
def index():
    return "<h1>HotelDocKorea 서버가 정상 작동 중입니다!</h1><p>데이터를 불러오려면 /api/hotels 주소로 접속하세요.</p>"

@app.route('/api/hotels')
def get_hotels():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return jsonify(data)
    else:
        return jsonify({"error": "데이터 파일(JSON)을 찾을 수 없습니다. parse_csv.py를 먼저 실행하세요."})

if __name__ == '__main__':
    app.run(debug=True, port=5000)