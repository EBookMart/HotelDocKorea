"""
HotelDocKorea TourAPI 매칭 스크립트 (Phase 3A-1.6 브랜드 사전 + 수동 매핑)

사용법:
    python scripts/tour_api_matcher.py --test           # 처음 10개
    python scripts/tour_api_matcher.py --test --limit 20
"""

import os
import re
import sys
import json
import time
import argparse
from pathlib import Path
from typing import Optional, Dict, List, Any
from dataclasses import dataclass, asdict

import requests
from dotenv import load_dotenv
from rapidfuzz import fuzz
from tqdm import tqdm

# sys.path에 scripts 폴더 추가 (같은 폴더 내 import)
sys.path.insert(0, str(Path(__file__).parent))
from hotel_brand_dictionary import (
    apply_brand_dictionary,
    normalize_hotel_name,
    get_manual_mapping,
    normalize_candidate_title,
)

# ─── 환경 설정 ────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
load_dotenv(PROJECT_ROOT / '.env')

TOUR_API_KEY = os.getenv('TOUR_API_KEY')
TOUR_API_ENDPOINT = os.getenv(
    'TOUR_API_ENDPOINT_KO',
    'https://apis.data.go.kr/B551011/KorService2'
)

if not TOUR_API_KEY:
    raise RuntimeError(
        ".env 파일에 TOUR_API_KEY가 설정되어 있지 않습니다.\n"
        "프로젝트 루트의 .env 파일을 확인해주세요."
    )

HOTEL_DATA_PATH = PROJECT_ROOT / 'Hotel_Data.json'
RESULTS_DIR = PROJECT_ROOT / 'scripts' / 'test_results'
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

API_DELAY_SEC = 1.0          # 0.3 → 1.0 (Rate Limit 여유)
RATE_LIMIT_RETRY_DELAY = 60  # 429 발생시 대기 시간(초)
MAX_RATE_LIMIT_RETRIES = 3   # 최대 재시도 횟수
MATCH_THRESHOLD_HIGH = 85
MATCH_THRESHOLD_LOW = 65


# ─── 데이터 클래스 ────────────────────────────────────────────
@dataclass
class MatchResult:
    hotel_name: str
    hotel_address: Optional[str]
    matched: bool
    content_id: Optional[str]
    matched_title: Optional[str]
    matched_addr: Optional[str]
    match_score: float
    mapx: Optional[str]
    mapy: Optional[str]
    first_image: Optional[str]
    search_trace: Optional[str]
    error: Optional[str] = None


# ─── TourAPI 호출 ─────────────────────────────────────────────
def search_hotel_by_keyword(keyword: str) -> List[Dict[str, Any]]:
    """TourAPI searchKeyword2 검색 (Rate Limit 자동 재시도 포함)"""
    params = {
        'serviceKey': TOUR_API_KEY,
        'numOfRows': 10,
        'pageNo': 1,
        'MobileOS': 'ETC',
        'MobileApp': 'HotelDocKorea',
        '_type': 'json',
        'keyword': keyword,
        'contentTypeId': 32,
        'arrange': 'A',
    }
    url = f"{TOUR_API_ENDPOINT}/searchKeyword2"

    for retry in range(MAX_RATE_LIMIT_RETRIES):
        try:
            response = requests.get(url, params=params, timeout=15)

            if response.status_code == 429:
                wait = RATE_LIMIT_RETRY_DELAY * (retry + 1)
                print(f"\n  [Rate Limit] {wait}초 대기 후 재시도 ({retry+1}/{MAX_RATE_LIMIT_RETRIES}): {keyword}")
                time.sleep(wait)
                continue

            response.raise_for_status()
            data = response.json()
            body = data.get('response', {}).get('body', {})
            items = body.get('items', {})
            if not items or items == '':
                return []
            item_list = items.get('item', [])
            if isinstance(item_list, dict):
                item_list = [item_list]
            return item_list

        except requests.exceptions.HTTPError as e:
            if e.response is not None and e.response.status_code == 429:
                wait = RATE_LIMIT_RETRY_DELAY * (retry + 1)
                print(f"\n  [Rate Limit] {wait}초 대기 후 재시도: {keyword}")
                time.sleep(wait)
                continue
            print(f"  [API 오류] {keyword}: {e}")
            return []
        except requests.exceptions.RequestException as e:
            print(f"  [네트워크 오류] {keyword}: {e}")
            return []
        except (ValueError, KeyError) as e:
            print(f"  [파싱 오류] {keyword}: {e}")
            return []

    print(f"  [Rate Limit 재시도 초과] {keyword}")
    return []


def find_best_match(
    hotel_name: str,
    hotel_address: Optional[str],
    candidates: List[Dict[str, Any]]
) -> Optional[Dict[str, Any]]:
    """
    호텔명 + 주소 기반 최적 매칭 탐색.
    핵심 개선: 원본과 후보 이름을 모두 정규화한 후 비교 + 자격 판단
    """
    if not candidates:
        return None

    # 원본 이름도 사전 변환 + 정규화 적용
    hotel_name_normalized = apply_brand_dictionary(
        normalize_hotel_name(hotel_name)
    )

    best_match = None
    best_combined_score = 0.0
    # 자격 후보 없을 때 정보 제공용 최고점 후보
    fallback_best = None
    fallback_best_score = 0.0

    for candidate in candidates:
        title = candidate.get('title', '').strip()
        addr = candidate.get('addr1', '').strip()

        # 후보 제목 정규화
        title_normalized = normalize_candidate_title(title)

        # 이름 점수: 정규화 버전꺼리 + 원본 버전 기준 둘 중 높은 것 채택
        name_score_normalized = fuzz.token_set_ratio(hotel_name_normalized, title_normalized)
        name_score_original = fuzz.token_set_ratio(hotel_name, title)
        name_score = max(name_score_normalized, name_score_original)

        # 주소 점수
        addr_score = 0.0
        if hotel_address and addr:
            addr_score = max(
                fuzz.partial_ratio(hotel_address, addr),
                fuzz.token_set_ratio(hotel_address, addr),
            )

        # 복합 점수
        combined_score = name_score * 0.6 + addr_score * 0.4

        # 자격 판단 티어 시스템
        is_qualified = False
        qualification_tier = None

        if name_score >= 85:
            is_qualified = True
            qualification_tier = "이름 고득점"
        elif name_score >= 70 and addr_score >= 90:
            is_qualified = True
            qualification_tier = "이름+주소 복합"
        elif name_score >= 60 and addr_score >= 95:
            is_qualified = True
            qualification_tier = "주소 우세"

        enriched_candidate = {
            **candidate,
            '_match_score': name_score,
            '_name_score_normalized': name_score_normalized,
            '_name_score_original': name_score_original,
            '_addr_score': addr_score,
            '_combined_score': combined_score,
            '_qualification_tier': qualification_tier,
            '_title_normalized': title_normalized,
        }

        if is_qualified and combined_score > best_combined_score:
            best_combined_score = combined_score
            best_match = enriched_candidate

        # 자격 없어도 폴백용으로 최고점은 저장
        if combined_score > fallback_best_score:
            fallback_best_score = combined_score
            fallback_best = enriched_candidate

    # 자격 후보 없으면 폴백(정보 제공용) 반환
    return best_match if best_match is not None else fallback_best


# ─── 키워드 생성 (브랜드 사전 기반) ─────────────────────────
def generate_search_keywords(
    hotel_name: str,
    hotel_address: Optional[str] = None
) -> List[str]:
    """
    4단계 fallback 검색 키워드 생성 (브랜드 사전 적용버전)
    1단계: 원본 정규화
    2단계: '호텔', '리조트' 등 공통어 제거
    3단계: 브랜드 사전 적용 (붙여쓰기 → 공백)
    4단계: 지역 접미사 제거 + 주소 결합
    """
    keywords = []
    normalized = normalize_hotel_name(hotel_name)

    # 1단계: 정규화된 원본
    keywords.append(normalized)

    # 2단계: 공통어 제거
    cleaned = normalized
    for word in ['호텔', '리조트', 'Hotel', 'HOTEL', 'Resort', 'RESORT']:
        cleaned = re.sub(rf'\b{word}\b', ' ', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    if cleaned and cleaned != normalized and len(cleaned) >= 2:
        keywords.append(cleaned)

    # 3단계: 브랜드 사전 적용 (핵심 개선)
    base = cleaned if cleaned and cleaned != normalized else normalized
    dict_applied = apply_brand_dictionary(base)
    if dict_applied != base and len(dict_applied) >= 2:
        keywords.append(dict_applied)

    # 공통어 제거하지 않은 원본에도 사전 적용
    dict_applied_original = apply_brand_dictionary(normalized)
    if dict_applied_original != normalized and dict_applied_original not in keywords:
        keywords.append(dict_applied_original)

    # 4단계: 지역 접미사 제거
    region_suffixes = [
        '강남', '강북', '강서', '강동', '서초', '송파', '영등포', '마포',
        '종로', '중구', '용산', '성동', '광진', '동대문', '서대문', '은평',
        '제주', '서귀포', '부산', '해운대', '광안리', '대구', '인천', '광주',
        '대전', '울산', '세종', '경주', '전주', '여수', '속초', '평창',
        '강릉', '춘천', '서울', '판교', '성남', '수원', '고양', '일산',
        '코엑스', '삼성', '삼성동',
    ]
    base_for_trim = dict_applied if dict_applied != base else (
        dict_applied_original if dict_applied_original != normalized else normalized
    )
    for suffix in sorted(region_suffixes, key=len, reverse=True):
        if base_for_trim.endswith(' ' + suffix) or base_for_trim == suffix:
            trimmed = base_for_trim[:-len(suffix)].strip()
            trimmed = re.sub(r'\s+', ' ', trimmed).strip()
            if trimmed and trimmed not in keywords and len(trimmed) >= 2:
                keywords.append(trimmed)
                break

    # 주소 기반 지역 결합 (마지막 보조)
    if hotel_address:
        gu_match = re.search(r'(\S+[구시군])', hotel_address)
        if gu_match:
            gu_name = gu_match.group(1)
            base_kw = keywords[2] if len(keywords) >= 3 else keywords[-1]
            combined = f"{base_kw} {gu_name}"
            if combined not in keywords:
                keywords.append(combined)

    # 중복 제거
    seen = set()
    unique = []
    for k in keywords:
        if k not in seen and len(k) >= 2:
            seen.add(k)
            unique.append(k)
    return unique


# ─── 핵심 매칭 함수 ───────────────────────────────────────────
def match_single_hotel_v2(hotel: Dict[str, Any]) -> MatchResult:
    hotel_name = (
        hotel.get('name') or hotel.get('hotelName')
        or hotel.get('호텔명', '') or hotel.get('이름', '')
    )
    hotel_address = hotel.get('address') or hotel.get('주소', '')

    if not hotel_name:
        return MatchResult(
            hotel_name='(이름 없음)', hotel_address=hotel_address,
            matched=False, content_id=None, matched_title=None,
            matched_addr=None, match_score=0.0, mapx=None, mapy=None,
            first_image=None, search_trace=None, error="호텔 이름이 없음"
        )

    # ① 수동 매핑 먼저 체크
    is_manual, manual_cid = get_manual_mapping(hotel_name)
    if is_manual:
        if manual_cid is None:
            return MatchResult(
                hotel_name=hotel_name, hotel_address=hotel_address,
                matched=False, content_id=None, matched_title=None,
                matched_addr=None, match_score=0.0,
                mapx=None, mapy=None, first_image=None,
                search_trace="수동 매핑",
                error="수동 매핑에서 매칭 불가로 지정됨 (TourAPI 미등록)"
            )
        else:
            return MatchResult(
                hotel_name=hotel_name, hotel_address=hotel_address,
                matched=True, content_id=manual_cid,
                matched_title=f"(수동 매핑) {hotel_name}",
                matched_addr=hotel_address, match_score=100.0,
                mapx=None, mapy=None, first_image=None,
                search_trace="수동 매핑", error=None
            )

    # ② 4단계 fallback 검색
    keywords = generate_search_keywords(hotel_name, hotel_address)

    best_result = None
    best_score = 0.0
    successful_keyword = None
    tried_keywords = []

    for i, keyword in enumerate(keywords, 1):
        tried_keywords.append(keyword)
        candidates = search_hotel_by_keyword(keyword)
        time.sleep(API_DELAY_SEC)

        if not candidates:
            continue

        best_in_round = find_best_match(hotel_name, hotel_address, candidates)
        if best_in_round:
            score = best_in_round.get('_match_score', 0)
            if score > best_score:
                best_score = score
                best_result = best_in_round
                successful_keyword = keyword
            # 1단계에서 고득점 바로 확정
            if i == 1 and score >= MATCH_THRESHOLD_HIGH:
                break
            if score >= 95:
                break

    search_trace = " -> ".join(tried_keywords)

    if best_result and best_score >= MATCH_THRESHOLD_HIGH:
        return MatchResult(
            hotel_name=hotel_name, hotel_address=hotel_address,
            matched=True,
            content_id=best_result.get('contentid'),
            matched_title=best_result.get('title'),
            matched_addr=best_result.get('addr1'),
            match_score=best_score,
            mapx=best_result.get('mapx'), mapy=best_result.get('mapy'),
            first_image=best_result.get('firstimage'),
            search_trace=f"성공 키워드: [{successful_keyword}] | 시도: {search_trace}",
            error=None
        )
    elif best_result and best_score >= MATCH_THRESHOLD_LOW:
        return MatchResult(
            hotel_name=hotel_name, hotel_address=hotel_address,
            matched=False, content_id=None,
            matched_title=best_result.get('title'),
            matched_addr=best_result.get('addr1'),
            match_score=best_score, mapx=None, mapy=None, first_image=None,
            search_trace=search_trace,
            error=f"점수 부족 (최고 {best_score:.1f}점, 임계값 {MATCH_THRESHOLD_HIGH})"
        )
    else:
        return MatchResult(
            hotel_name=hotel_name, hotel_address=hotel_address,
            matched=False, content_id=None, matched_title=None,
            matched_addr=None, match_score=0.0,
            mapx=None, mapy=None, first_image=None,
            search_trace=search_trace,
            error=f"모든 검색 실패 (시도: {search_trace})"
        )


# ─── 테스트 실행 ──────────────────────────────────────────────
def run_test(limit: int = 10):
    print("=" * 60)
    print(f"Phase 3A-1.6 테스트 (브랜드 사전 적용): 처음 {limit}개 호텔")
    print("=" * 60)

    with open(HOTEL_DATA_PATH, 'r', encoding='utf-8') as f:
        all_hotels = json.load(f)

    if isinstance(all_hotels, dict):
        print("중첩된 지역/등급 구조 감지됨. 데이터를 추출합니다...")
        flat_list = []
        for region, grades in all_hotels.items():
            if isinstance(grades, dict):
                for grade, hotels in grades.items():
                    if isinstance(hotels, list):
                        flat_list.extend(hotels)
            elif isinstance(grades, list):
                flat_list.extend(grades)
        all_hotels = flat_list
        print(f"총 {len(all_hotels)}개의 호텔 데이터를 추출했습니다.")
    elif not isinstance(all_hotels, list):
        print(f"[오류] 예상치 못한 데이터 형식: {type(all_hotels)}")
        return

    test_hotels = all_hotels[:limit]
    print(f"테스트 대상: {len(test_hotels)}개 호텔\n")

    results = []
    for i, hotel in enumerate(test_hotels, 1):
        name = (
            hotel.get('name') or hotel.get('hotelName')
            or hotel.get('호텔명', '') or hotel.get('이름', '이름없음')
        )
        print(f"[{i}/{len(test_hotels)}] {name}")
        kws = generate_search_keywords(name, hotel.get('address') or hotel.get('주소', ''))
        print(f"  키워드: {kws}")

        result = match_single_hotel_v2(hotel)
        results.append(result)

        if result.matched:
            print(f"  [성공] 점수: {result.match_score:.1f}")
            print(f"     -> {result.matched_title} (contentId: {result.content_id})")
            print(f"     -> {result.search_trace}")
        else:
            print(f"  [실패] {result.error}")
            if result.matched_title:
                print(f"     후보: {result.matched_title} ({result.match_score:.1f}점)")
        print()

    # 결과 저장 (v1.6 파일명)
    output_file = RESULTS_DIR / 'phase_3a_1_6_test_results.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump([asdict(r) for r in results], f, ensure_ascii=False, indent=2)

    matched_count = sum(1 for r in results if r.matched)
    print("=" * 60)
    print(f"테스트 결과 요약 (Phase 3A-1.6)")
    print(f"   매칭 성공: {matched_count}/{len(results)} ({100 * matched_count / len(results):.1f}%)")
    print(f"   결과 파일: {output_file}")
    print("=" * 60)


def run_all(resume: bool = False):
    """Phase 3A-2: 전체 호텔 매칭 실행 (resume 지원)"""
    print("=" * 70)
    print("Phase 3A-2: 전체 호텔 매칭 실행")
    print("=" * 70)

    with open(HOTEL_DATA_PATH, 'r', encoding='utf-8') as f:
        all_data = json.load(f)

    all_hotels = []
    if isinstance(all_data, list):
        all_hotels = all_data
    elif isinstance(all_data, dict):
        for region, grades in all_data.items():
            if isinstance(grades, dict):
                for grade, hotels in grades.items():
                    if isinstance(hotels, list):
                        for h in hotels:
                            h_copy = dict(h)
                            h_copy['_region'] = region
                            h_copy['_grade'] = grade
                            all_hotels.append(h_copy)

    print(f"전체 호텔 수: {len(all_hotels)}개")

    progress_file = RESULTS_DIR / 'phase_3a_2_progress.json'
    final_file = RESULTS_DIR / 'phase_3a_2_full_results.json'

    completed_indices = set()
    results = []

    if resume and progress_file.exists():
        with open(progress_file, 'r', encoding='utf-8') as f:
            saved = json.load(f)
            results = saved.get('results', [])
            completed_indices = set(saved.get('completed_indices', []))
        print(f"[Resume] 기존 {len(completed_indices)}개 호텔 건너뜀")
    else:
        if progress_file.exists():
            progress_file.unlink()

    save_interval = 20
    batch_count = 0

    try:
        for i, hotel in enumerate(tqdm(all_hotels, desc="Matching")):
            if i in completed_indices:
                continue

            try:
                result = match_single_hotel_v2(hotel)
                result_dict = asdict(result)
                result_dict['_index'] = i
                result_dict['_region'] = hotel.get('_region', '')
                result_dict['_grade'] = hotel.get('_grade', '')
                results.append(result_dict)
                completed_indices.add(i)
                batch_count += 1

                if batch_count >= save_interval:
                    _save_progress(progress_file, results, completed_indices)
                    batch_count = 0

            except Exception as e:
                print(f"\n  [ERROR] 호텔 {i} 처리 중 에러: {e}")
                results.append({
                    '_index': i,
                    'hotel_name': hotel.get('name', '이름없음'),
                    '_region': hotel.get('_region', ''),
                    '_grade': hotel.get('_grade', ''),
                    'matched': False,
                    'error': f'예외 발생: {str(e)}',
                    'match_score': 0.0,
                })
                completed_indices.add(i)

        _save_progress(progress_file, results, completed_indices)

        with open(final_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)

        if progress_file.exists():
            progress_file.unlink()

        _generate_report(results, RESULTS_DIR / 'phase_3a_2_report.md')

        matched_count = sum(1 for r in results if r.get('matched'))
        total = len(results)
        print("\n" + "=" * 70)
        print(f"전체 매칭 완료!")
        print(f"  성공: {matched_count}/{total} ({100 * matched_count / total:.1f}%)")
        print(f"  결과 파일: {final_file}")
        print(f"  리포트: {RESULTS_DIR / 'phase_3a_2_report.md'}")
        print("=" * 70)

    except KeyboardInterrupt:
        print("\n\n[중단됨] 진행률이 저장되었습니다.")
        print(f"재개 명령: python scripts/tour_api_matcher.py --all --resume")
        _save_progress(progress_file, results, completed_indices)


def _save_progress(progress_file, results, completed_indices):
    """20개마다 진행률 저장"""
    with open(progress_file, 'w', encoding='utf-8') as f:
        json.dump({
            'completed_indices': list(completed_indices),
            'results': results,
        }, f, ensure_ascii=False, indent=2)


def _generate_report(results: list, output_path):
    """Phase 3A-2 실패 패턴 분석 리포트 생성"""
    from collections import defaultdict

    total = len(results)
    matched_list = [r for r in results if r.get('matched')]
    failed_list = [r for r in results if not r.get('matched')]

    region_stats = defaultdict(lambda: {'total': 0, 'matched': 0})
    grade_stats = defaultdict(lambda: {'total': 0, 'matched': 0})

    for r in results:
        region = r.get('_region', '미분류')
        grade = r.get('_grade', '미분류')
        region_stats[region]['total'] += 1
        grade_stats[grade]['total'] += 1
        if r.get('matched'):
            region_stats[region]['matched'] += 1
            grade_stats[grade]['matched'] += 1

    failed_names = [
        f"- {r.get('hotel_name', '이름없음')} "
        f"({r.get('_region', '')}/{r.get('_grade', '')}) — {r.get('error', '에러불명')[:60]}"
        for r in failed_list[:50]
    ]

    lines = [
        "# Phase 3A-2 · 전체 호텔 매칭 결과 리포트",
        "",
        f"- **전체 호텔**: {total}개",
        f"- **매칭 성공**: {len(matched_list)}개 ({100*len(matched_list)/total:.1f}%)",
        f"- **매칭 실패**: {len(failed_list)}개 ({100*len(failed_list)/total:.1f}%)",
        "",
        "## 권역별 매칭 성공률",
        "",
        "| 권역 | 총 호텔 | 매칭 성공 | 성공률 |",
        "|---|---:|---:|---:|",
    ]
    for region, stats in sorted(region_stats.items()):
        rate = 100 * stats['matched'] / stats['total'] if stats['total'] else 0
        lines.append(f"| {region} | {stats['total']} | {stats['matched']} | {rate:.1f}% |")

    lines.extend([
        "",
        "## 등급별 매칭 성공률",
        "",
        "| 등급 | 총 호텔 | 매칭 성공 | 성공률 |",
        "|---|---:|---:|---:|",
    ])
    for grade, stats in sorted(grade_stats.items()):
        rate = 100 * stats['matched'] / stats['total'] if stats['total'] else 0
        lines.append(f"| {grade} | {stats['total']} | {stats['matched']} | {rate:.1f}% |")

    lines.extend([
        "",
        f"## 매칭 실패 호텔 목록 (상위 {min(50, len(failed_list))}개)",
        "",
    ])
    lines.extend(failed_names)
    if len(failed_list) > 50:
        lines.append(f"\n*... 외 {len(failed_list) - 50}개 더 있음.*")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))


def main():
    parser = argparse.ArgumentParser(description="HotelDocKorea TourAPI 매칭 스크립트")
    parser.add_argument('--test', action='store_true', help='처음 N개만 테스트')
    parser.add_argument('--limit', type=int, default=10, help='테스트 개수 (기본 10)')
    parser.add_argument('--all', dest='run_all_flag', action='store_true', help='전체 520개 실행')
    parser.add_argument('--resume', action='store_true', help='중단된 작업 재개')
    args = parser.parse_args()

    if args.test:
        run_test(args.limit)
    elif args.run_all_flag:
        run_all(resume=args.resume)
    else:
        print("모드를 지정하세요: --test 또는 --all")
        print("  테스트: python scripts/tour_api_matcher.py --test")
        print("  전체:   python scripts/tour_api_matcher.py --all")


if __name__ == '__main__':
    main()
