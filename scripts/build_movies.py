import os
import json
import frontmatter
import datetime
from collections import defaultdict

MOVIES_DIR = "movies"
CACHE_PATH = "tmdb_cache.json"
OUTPUT_PATH = "movies.json"

def json_default(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


with open(CACHE_PATH, "r") as f:
    cache = json.load(f)

days = defaultdict(list)

for filename in os.listdir(MOVIES_DIR):
    if not filename.endswith(".md"):
        continue

    post = frontmatter.load(os.path.join(MOVIES_DIR, filename))
    data = post.metadata

    movie = {}

    source = data.get("source")

    if source == "tmdb":
        tmdb_id = str(data.get("tmdb_id"))
        cached = cache.get(tmdb_id, {})

        movie.update(cached)

    movie.update({
        "title": data.get("title", movie.get("title")),
        "year": data.get("year") or movie.get("year"),
        "poster_path": data.get("poster") or movie.get("poster"),
        "genres": data.get("genres") or movie.get("genres"),
        "rating": data.get("rating"),
        "notes": data.get("notes")
    })

    date = data.get("date")
    if not date:
        continue

    days[date].append(movie)

output = [
    {
        "date": date,
        "movies": movies
    }
    for date, movies in sorted(days.items())
]

with open(OUTPUT_PATH, "w") as f:
    json.dump(output, f, indent=2, default=json_default)

print("movies.json built")

