"""Fetch the publisher's versioned CSV and source documents; no API keys required."""
import hashlib
import json
from pathlib import Path
import urllib.request
import sys
import urllib.parse

ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / 'data' / 'raw'

def fetch(url):
    request = urllib.request.Request(url, headers={'User-Agent': 'HollywoodLuckLab/0.2 educational-research-prototype'})
    with urllib.request.urlopen(request, timeout=40) as response:
        return response.read()

def main():
    DEST.mkdir(parents=True, exist_ok=True)
    # Keep a byte-for-byte local snapshot even if the unauthenticated commit API is rate limited.
    try:
        upstream = json.loads(fetch('https://api.github.com/repos/fivethirtyeight/data/commits?path=bechdel/movies.csv&per_page=1'))[0]['sha']
    except urllib.error.HTTPError as error:
        if error.code != 403:
            raise
        upstream = None
    revision = upstream or 'master'
    urls = {
        'movies.csv': f'https://raw.githubusercontent.com/fivethirtyeight/data/{revision}/bechdel/movies.csv',
        'README-upstream.md': f'https://raw.githubusercontent.com/fivethirtyeight/data/{revision}/bechdel/README.md',
        'LICENSE-upstream.txt': 'https://raw.githubusercontent.com/fivethirtyeight/data/master/LICENSE',
    }
    manifest = {'retrieved': '2026-11-12', 'publisher': 'FiveThirtyEight', 'commit': upstream, 'files': {}}
    for name, url in urls.items():
        raw = fetch(url)
        (DEST / name).write_bytes(raw)
        manifest['files'][name] = {'url': url, 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    (DEST / 'provenance.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps(manifest, indent=2))

if __name__ == '__main__':
    if '--media' in sys.argv:
        from fetch_media import main as media_main
        media_main()
    elif '--probe-media' in sys.argv:
        for title in ['John_Carter_(film)', 'Sherry_Lansing', 'Alan_F._Horn']:
            url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(title)
            try:
                data = json.loads(fetch(url))
                print(json.dumps({'title':title,'thumbnail':data.get('thumbnail'),'originalimage':data.get('originalimage'),'page':data.get('content_urls')},ensure_ascii=False))
            except Exception as error:
                print(title, type(error).__name__, str(error))
    else:
        main()
