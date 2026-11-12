"""Cache public research sources with hashes; never crawl authenticated pages."""
import hashlib
import json
import zipfile
from pathlib import Path
from fetch_sources import fetch

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data/raw/research'
SOURCES = {
    'tmdb-5000.zip': 'https://www.kaggle.com/api/v1/datasets/download/tmdb/tmdb-movie-metadata',
    'tmdb-metadata.json': 'https://www.kaggle.com/api/v1/datasets/list?search=tmdb%20movie%20metadata',
    'tmdb-description.json': 'https://www.kaggle.com/api/v1/datasets/view/tmdb/tmdb-movie-metadata',
    'netflix-global.tsv': 'https://www.netflix.com/tudum/top10/data/all-weeks-global.tsv',
}

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    path = DEST / 'provenance.json'
    manifest = json.loads(path.read_text()) if path.exists() else {}
    for name, url in SOURCES.items():
        if name in manifest and (DEST / name).exists():
            continue
        try:
            raw = fetch(url)
            if name.endswith('.zip') and raw[:2] != b'PK':
                raise ValueError('Source did not return a ZIP; authentication or challenge may be required')
            (DEST / name).write_bytes(raw)
            manifest[name] = {'url': url, 'retrieved': '2026-11-12', 'bytes': len(raw), 'sha256': hashlib.sha256(raw).hexdigest()}
            path.write_text(json.dumps(manifest, indent=2) + '\n')
            print(name, len(raw), flush=True)
        except Exception as error:
            print('UNAVAILABLE', name, str(error), flush=True)
    archive = DEST / 'tmdb-5000.zip'
    if archive.exists():
        with zipfile.ZipFile(archive) as z:
            for name in ['tmdb_5000_movies.csv', 'tmdb_5000_credits.csv']:
                (DEST / name).write_bytes(z.read(name))
        print('Extracted the two publisher CSVs.', flush=True)

if __name__ == '__main__':
    main()
