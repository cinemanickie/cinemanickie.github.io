import os
import json
import frontmatter
import requests
from datetime import date

MOVIES_DIR = "movies"
CACHE_PATH = "tmdb_cache.json"

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
if not TMDB_API_KEY:
    raise ValueError("TMDB_API_KEY not set")

if os.path.exists(CACHE_PATH):
    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)
else:
    cache = {}

for filename in os.listdir(MOVIES_DIR):
    if not filename.endswith(".md"):
        continue

    path = os.path.join(MOVIES_DIR, filename)
    post = frontmatter.load(path)
    data = post.metadata

    if data.get("source") != "tmdb":
        continue

    tmdb_id = data.get("tmdb_id")
    if not tmdb_id:
        continue

    tmdb_id = str(tmdb_id)

    if tmdb_id in cache:
        print(f"✓ cached: {tmdb_id}")
        continue

    print(f"→ fetching TMDB {tmdb_id}")

    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}"
    res = requests.get(url, params={"api_key": TMDB_API_KEY})

    if res.status_code != 200:
        print(f"⚠ failed to fetch TMDB {tmdb_id}")
        continue

    movie = res.json()

    cache[tmdb_id] = {
        "title": movie.get("title"),
        "year": movie.get("release_date"),
        "poster": (
            f"https://image.tmdb.org/t/p/w500{movie['poster_path']}"
            if movie.get("poster_path")
            else None
        ),
        "genres": [g["name"] for g in movie.get("genres", [])],
        "overview": movie.get("overview")
    }

with open(CACHE_PATH, "w") as f:
    json.dump(cache, f, indent=2)

print("TMDB cache updated.")

