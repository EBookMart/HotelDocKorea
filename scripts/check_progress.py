"""진행률 확인 스크립트"""
import json
from pathlib import Path

p = Path('scripts/test_results/phase_3a_2_progress.json')
out = Path('scripts/test_results/progress_check.txt')

if not p.exists():
    print("progress 파일 없음 - 아직 첫 20개 미완료")
    exit()

try:
    d = json.loads(p.read_text(encoding='utf-8'))
except Exception as e:
    print(f"파싱 실패 (파일 쓰기 중): {e}")
    exit()

results = d.get('results', [])
done = len(d.get('completed_indices', []))
matched = sum(1 for r in results if r.get('matched'))
rate = matched / done * 100 if done else 0

region = {}
for r in results:
    reg = r.get('_region', '미분류')
    if reg not in region:
        region[reg] = {'t': 0, 'm': 0}
    region[reg]['t'] += 1
    if r.get('matched'):
        region[reg]['m'] += 1

lines = [
    f"완료: {done}/520 | 성공: {matched} | 성공률: {rate:.1f}%",
    "--- 권역별 ---",
]
for reg, s in sorted(region.items()):
    r2 = s['m'] / s['t'] * 100 if s['t'] else 0
    lines.append(f"  {reg}: {s['m']}/{s['t']} ({r2:.1f}%)")

output = "\n".join(lines)
print(output)
out.write_text(output, encoding='utf-8')
print("\n=> 저장 완료")
