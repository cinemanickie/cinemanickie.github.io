import json
import glob
import re
from pathlib import Path

def slugify(title: str) -> str:
    title = title.lower()
    title = re.sub(r"[^\w\s-]", "", title)  # remove punctuation
    title = re.sub(r"\s+", "-", title.strip())
    return title

input_files = glob.glob("old/*.json")
output_dir = Path("movies_md")
output_dir.mkdir(exist_ok=True)

for file_path in input_files:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    date = Path(file_path).stem

    for block in data:
        for movie in block.get("movies", []):
            title = movie.get("title")
            tmdb_id = movie.get("tmdb_id")

            source = 'manual' if tmdb_id == 'N/A' else 'tmdb'

            if not title or not tmdb_id:
                continue

            filename = f"{slugify(title)}.md"

            md_content = f"""---
id: {Path(filename).stem}
source: {source}{f"\ntmdb_id: {tmdb_id}" if source == 'tmdb' else ''}

title: "{title}"{f"\nyear: " if source == 'manual' else ''}
date: {date}
---
"""

            (output_dir / filename).write_text(md_content, encoding="utf-8")

