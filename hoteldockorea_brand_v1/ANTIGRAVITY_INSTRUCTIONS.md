# Antigravity 작업 지시서: 로고·서브타이틀·메타데이터 교체

## 목표
HotelDocKorea 프로젝트에 새 로고와 서브타이틀을 적용합니다.
현재 헤더의 "실시간 호텔 프로모션 가이드" 텍스트를 새 서브타이틀로 교체하고,
공식 브랜드 SVG 파일들을 프로젝트에 추가합니다.

## 수정 범위

**추가할 파일** (새로 생성):
- `public/logo.svg` (메인 로고 · 컬러)
- `public/logo-white.svg` (어두운 배경용)
- `public/favicon.svg` (브라우저 탭)
- `public/apple-touch-icon.png` (iOS · SVG를 PNG로 변환)

**수정할 파일**:
- `src/app/layout.tsx` (메타데이터 업데이트)
- `src/components/HomeClient.tsx` (헤더 부분)
- `src/app/favicon.ico` (기존 아이콘 교체)

**절대 수정 금지**:
- 기존 호텔 데이터 (`Hotel_Data.json`, `Hotel_List.csv`)
- Python 스크립트 (`parse_csv.py`, `app.py`)
- 환경변수 파일 (`.env`)

## 적용 단계

### 1단계 — 로고 SVG 파일 복사

아래 4개 SVG 파일을 `public/` 디렉토리에 그대로 저장:

`public/logo.svg`:
```svg
<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200" role="img" aria-label="HotelDocKorea 로고">
  <title>HotelDocKorea</title>
  <defs>
    <clipPath id="frame">
      <rect x="10" y="10" width="180" height="180" rx="24"/>
    </clipPath>
  </defs>
  <g clip-path="url(#frame)">
    <rect x="10" y="10" width="180" height="180" fill="#FADDDC"/>
    <path d="M 10 100 Q 55 80 100 100 T 190 100 L 190 190 L 10 190 Z" fill="#D4E4F2"/>
  </g>
  <rect x="10" y="10" width="180" height="180" rx="24" fill="none" stroke="#534AB7" stroke-width="1.5"/>
  <g fill="#534AB7">
    <rect x="33" y="35" width="17" height="118"/>
    <rect x="33" y="84" width="54" height="17"/>
    <rect x="70" y="35" width="17" height="118"/>
  </g>
  <path d="M 102 35 L 102 153 L 120 153 Q 167 153 167 94 Q 167 35 120 35 Z"
        fill="#FFFFFF" fill-opacity="0.5"
        stroke="#534AB7" stroke-width="1"/>
</svg>
```

`public/favicon.svg`는 `logo.svg`와 동일 내용으로 복사 (Next.js가 자동으로 탭 아이콘으로 사용).

### 2단계 — HomeClient.tsx 헤더 교체

현재 `src/components/HomeClient.tsx` 파일에서 헤더 영역을 찾아 다음과 같이 교체:

**변경 전**:
- 텍스트로만 "HotelDocKorea" 표시
- 서브타이틀: "실시간 호텔 프로모션 가이드"

**변경 후**:
- 로고 SVG 이미지 사용
- 서브타이틀: "떠나기 전, 가장 먼저 열어보는 호텔 가이드"

다음 구조로 헤더 구현:

```tsx
import Image from "next/image";

<div className="flex items-center gap-4">
  <Image
    src="/logo.svg"
    alt="HotelDocKorea"
    width={56}
    height={56}
    priority
  />
  <div>
    <h1 className="text-3xl font-bold tracking-tight">HotelDocKorea</h1>
    <p className="text-sm opacity-80 mt-1">
      떠나기 전, 가장 먼저 열어보는 호텔 가이드
    </p>
  </div>
</div>
```

### 3단계 — layout.tsx 메타데이터 업데이트

`src/app/layout.tsx`의 `metadata` 객체를 다음과 같이 업데이트:

```tsx
export const metadata: Metadata = {
  title: "HotelDocKorea — 한국 호텔 프로모션 가이드",
  description:
    "한국 3성급 이상 호텔·리조트 520여 곳의 실시간 프로모션, 주변 축제와 맛집, 기상정보까지 한 곳에서. 떠나기 전 반드시 확인하세요.",
  keywords: ["한국 호텔", "호텔 프로모션", "리조트", "축제", "여행", "숙박"],
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "HotelDocKorea",
    description: "떠나기 전, 가장 먼저 열어보는 호텔 가이드",
    images: ["/logo.svg"],
    locale: "ko_KR",
    type: "website",
  },
};
```

### 4단계 — 반응형 확인

모바일·태블릿·데스크톱 각 화면에서 로고가 적절히 표시되는지 확인:
- 모바일 (<640px): 로고 크기 40×40
- 태블릿 (640~1023px): 로고 크기 48×48
- 데스크톱 (≥1024px): 로고 크기 56×56

Tailwind 반응형 클래스 사용:
```tsx
<Image
  src="/logo.svg"
  alt="HotelDocKorea"
  width={56}
  height={56}
  className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
  priority
/>
```

## 검증 기준

작업 완료 후 다음을 모두 확인:

- [ ] `localhost:3000` 접속 시 헤더에 새 로고가 보인다
- [ ] 로고 옆에 "떠나기 전, 가장 먼저 열어보는 호텔 가이드" 서브타이틀이 표시된다
- [ ] 브라우저 탭(tab)에 새 파비콘이 보인다
- [ ] 브라우저 탭 제목이 "HotelDocKorea — 한국 호텔 프로모션 가이드"이다
- [ ] 이전 서브타이틀 "실시간 호텔 프로모션 가이드"가 사이트 어디에도 남아있지 않다
- [ ] 모바일 크기 (개발자도구 반응형 모드)에서도 로고가 깨지지 않고 표시된다
- [ ] 콘솔(F12 → Console)에 이미지 로드 관련 에러가 없다

## 주의사항

- 로고는 **SVG 원본 크기가 200×200**이지만 `width/height` 속성으로 표시 크기를 조절합니다
- 파비콘용 PNG 변환이 필요하면 `sharp` 또는 `imagemagick` 사용
- 이 작업은 **로고·서브타이틀 교체만** 목표입니다. 레이아웃 재구성이나 기능 추가는 다음 단계에서 진행합니다
- 문의사항이 있으면 작업 중단 후 사용자에게 확인 요청
