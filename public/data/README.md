# HOT 프로모션 데이터 관리 가이드

이 디렉토리의 `hot-picks.json` 파일을 편집하여 웹사이트의 'HOT 프로모션' 섹션을 관리할 수 있습니다.

## 1. 프로모션 추가 방법
`promotions` 배열 안에 새로운 객체를 추가합니다.

```json
{
  "hotelName": "호텔이름",
  "promoTitle": "프로모션 제목",
  "discount": "혜택 내용",
  "active": true,
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD"
}
```

## 2. 주의사항
- **호텔 이름**: `hotels.json`에 등록된 `이름` 필드와 정확히 일치해야 이미지가 정상적으로 표시됩니다.
- **날짜 형식**: `YYYY-MM-DD` 형식을 지켜주세요.
- **Active**: `true`로 설정된 항목만 노출 후보가 됩니다.
- **JSON 문법**: 쉼표(`,`), 중괄호(`{}`), 대괄호(`[]`)가 빠지지 않도록 주의하세요. 마지막 항목 뒤에는 쉼표를 붙이지 않습니다.

## 3. 자동 노출 로직
- `active`가 `true`이고, 오늘 날짜가 `startDate`와 `endDate` 사이인 항목만 최대 4개 노출됩니다.
- 조건에 맞는 프로모션이 4개 미만인 경우, 시스템이 자동으로 5성급 호텔 중 이미지가 있는 곳을 채워넣습니다.

---

## 4. 축제·공연·행사 관리 (festivals.json)

### 파일 위치
`public/data/festivals.json`

### 새 축제 추가 방법
1. `festivals.json` 열기
2. `festivals` 배열 안에 새 항목 추가:
```json
{
  "id": "고유한-영문-ID",
  "icon": "🎉",
  "name": "축제 이름",
  "period": "2026.05.01 ~ 05.07",
  "startDate": "2026-05-01",
  "endDate": "2026-05-07",
  "location": "개최 장소",
  "description": "한 줄 설명",
  "region": "수도권",
  "active": true,
  "i18n": {}
}
```
3. 저장 후 브라우저 새로고침 시 자동 반영됩니다.

### 주의사항
- **종료일 자동 제거**: `endDate`가 오늘보다 이전이면 목록에서 자동으로 제외됩니다.
- **Region**: "수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도" 중 하나를 사용하세요.

## 5. 맛집·관광지 관리 (attractions.json)

### 파일 위치
`public/data/attractions.json`

### 새 장소 추가 방법
1. `attractions.json` 열기
2. `attractions` 배열 안에 새 항목 추가:
```json
{
  "id": "고유한-영문-ID",
  "category": "food",
  "icon": "🍴",
  "name": "장소명",
  "address": "주소",
  "tag": "카테고리 태그",
  "region": "수도권",
  "active": true,
  "i18n": {}
}
```

### 필수 필드
- **category**: `"food"`(맛집) 또는 `"attraction"`(관광지) 중 선택
- **id**: 영문+하이픈 조합의 중복되지 않는 고유 키

