import os
import json
import frontmatter
import datetime
from collections import defaultdict

MOVIES_DIR = "movies"
ANNOUNCEMENTS_DIR = "announcements"
CACHE_PATH = "tmdb_cache.json"
OUTPUT_PATH = "movies.json"

def json_default(obj):
    if isinstance(obj, (datetime.date, datetime.datetime)):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")


def load_cache(path):
    with open(CACHE_PATH, "r") as f:
        cache = json.load(f)

    return cache

def build_movies(cache):
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
            "poster": data.get("poster") or movie.get("poster"),
            "genres": data.get("genres") or movie.get("genres"),
            "rating": data.get("rating"),
            "notes": data.get("notes")
        })

        date = data.get("date")
        hide = data.get("hide")
        if not date or hide:
            continue

        days[date].append(movie)

    output = [
        {
            "date": date,
            "movies": movies
        }
        for date, movies in sorted(days.items())
    ]

    return output

def build_announcements():
    announcements = []
    today = datetime.date.today()

    for filename in os.listdir(ANNOUNCEMENTS_DIR):
        print(f"{filename}");
        if not filename.endswith(".md"):
            continue

        post = frontmatter.load(os.path.join(ANNOUNCEMENTS_DIR, filename))
        data = post.metadata

        expires = data.get("expires")
        if expires and today > expires:
            continue
        
        announcements.append({
            "title": data.get("title", ""),
            "message": data.get("message", ""),
            "expires": expires,
            "icon": data.get("icon", ""),
        });

    announcements.sort(key=lambda a: a['expires'] or datetime.date.max)

    return announcements

def main():
    cache = load_cache(CACHE_PATH)
    movies_schedule = build_movies(cache)
    announcements = build_announcements()

    output = {
        "announcements": announcements,
        "schedule": movies_schedule
    }

    with open(OUTPUT_PATH, "w") as f:
        json.dump(output, f, indent=2, default=json_default)

    print(f"{OUTPUT_PATH} built successfully")

if __name__ == "__main__":
    main()

