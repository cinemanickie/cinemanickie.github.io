import json
import os

INPUT_DIR = "movies"
OUTPUT_FILE = "movies.json"

combined = []

files = sorted(f for f in os.listdir(INPUT_DIR) if f.endswith(".json"))

for filename in files:
    filepath = os.path.join(INPUT_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        movies_list = json.load(f)
        
        date = os.path.splitext(filename)[0]

        combined.append({
            "date": date,
            "movies": movies_list[0]["movies"]
        })

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(combined, f, indent=2)

print(f"Combined JSON saved to {OUTPUT_FILE}")

