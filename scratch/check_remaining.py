
import json
from pathlib import Path

def get_remaining():
    with open('Hotel_Data.json', 'r', encoding='utf-8') as f:
        all_data = json.load(f)
    
    all_hotels = []
    for region, grades in all_data.items():
        if isinstance(grades, dict):
            for grade, hotels in grades.items():
                for h in hotels:
                    h_copy = dict(h)
                    h_copy['_region'] = region
                    h_copy['_grade'] = grade
                    all_hotels.append(h_copy)
    
    # Already completed indices
    progress_path = Path('scripts/test_results/phase_3a_2_progress.json')
    completed = set()
    if progress_path.exists():
        with open(progress_path, 'r', encoding='utf-8') as f:
            d = json.load(f)
            completed = set(d.get('completed_indices', []))
    
    print(f"Total: {len(all_hotels)}")
    print(f"Completed: {len(completed)}")
    
    remaining = [h for i, h in enumerate(all_hotels) if i not in completed]
    print(f"Remaining: {len(remaining)}")
    
    for i, h in enumerate(remaining[:10]):
        print(f"- {h.get('이름', 'N/A')} ({h.get('_region', 'N/A')})")

get_remaining()
