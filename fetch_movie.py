import os
import json
import requests
import sys

from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("TMDB_API_KEY")
if not API_KEY:
    raise ValueError("TMDB_API_KEY not set")

MOVIES_DIR = "movies"
os.makedirs(MOVIES_DIR, exist_ok=True)

def fetch_movie(tmdb_id):
    url = f"https://api.themoviedb.org/3/movie/{tmdb_id}?api_key={API_KEY}&language=en-US"
    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Error fetching TMDb ID {tmdb_id}: {response.status_code}")
    data = response.json()
    return {
        "tmdb_id": tmdb_id,
        "title": data.get("title"),
        "poster_path": f"https://image.tmdb.org/t/p/w500{data.get('poster_path')}" if data.get("poster_path") else None,
        "genres": [g['name'] for g in data['genres']]
    }

def add_movie_to_date(date, movie):
    filename = os.path.join(MOVIES_DIR, f"{date}.json")
    
    if os.path.exists(filename):
        with open(filename, "r", encoding="utf-8") as f:
            date_movies = json.load(f)
    else:
        date_movies = [{"movies": []}]
    
    existing_ids = [m["tmdb_id"] for m in date_movies[0]["movies"]]
    if movie["tmdb_id"] in existing_ids:
        print(f"{movie['title']} already exists in {filename}")
        return
    
    date_movies[0]["movies"].append(movie)
    
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(date_movies, f, indent=2)
    
    print(f"Added {movie['title']} to {filename}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python add_movie.py <tmdb_id> <YYYY-MM-DD>")
        sys.exit(1)
    
    tmdb_id = sys.argv[1]
    date = sys.argv[2]
    
    try:
        movie_info = fetch_movie(tmdb_id)
        add_movie_to_date(date, movie_info)
    except Exception as e:
        print("Error:", e)

