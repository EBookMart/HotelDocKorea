import json
from pathlib import Path

MATCH_FILE = Path('scripts/test_results/phase_3a_2_full_results.json')

def search_refined():
    with open(MATCH_FILE, encoding='utf-8') as f:
        data = json.load(f)
    
    targets = ['시그니엘', '파라다이스', '롯데호텔', '그랜드조선']
    for t in targets:
        print(f"--- Searching for '{t}' ---")
        matches = [m for m in data if m.get('matched') and t in m.get('matched_title', '')]
        if not matches:
            # Try original_title
            matches = [m for m in data if m.get('matched') and t in m.get('_original_title', '')]
            
        for m in matches:
            print(f"Original: {m.get('_original_title')}")
            print(f"Matched:  {m.get('matched_title')}")
            print(f"Image:    {m.get('first_image')}")
            print()

if __name__ == "__main__":
    search_refined()
