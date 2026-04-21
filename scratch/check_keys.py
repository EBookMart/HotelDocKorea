import json

with open('Hotel_Data.json', encoding='utf-8') as f:
    data = json.load(f)

frontend_keys = ["수도권", "영동권", "부산경남권", "대구경북권", "광주호남권", "충청권", "제주도"]
data_keys = list(data.keys())

print(f"Data keys ({len(data_keys)}): {data_keys}")
print(f"Frontend keys ({len(frontend_keys)}): {frontend_keys}")

missing_in_frontend = [k for k in data_keys if k not in frontend_keys]
missing_in_data = [k for k in frontend_keys if k not in data_keys]

print(f"\nMissing in Frontend: {missing_in_frontend}")
print(f"Missing in Data: {missing_in_data}")

# Count hotels per region in data
for k in data_keys:
    count = sum(len(grade_list) for grade_list in data[k].values())
    print(f"- {k}: {count} hotels")
