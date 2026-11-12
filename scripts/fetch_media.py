"""Cache small reference images plus attribution metadata from Wikipedia / Commons."""
import hashlib
import json
from pathlib import Path
import time
import urllib.parse
import urllib.error
from fetch_sources import fetch

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'public/assets'
SUBJECTS = {
    'inception': 'Inception', 'bridesmaids': 'Bridesmaids_(2011_film)',
    'moneyball': 'Moneyball_(film)', 'social-network': 'The_Social_Network',
    'pacific-rim': 'Pacific_Rim_(film)', 'john-carter': 'John_Carter_(film)',
    'lone-ranger': 'The_Lone_Ranger_(2013_film)', 'gravity': 'Gravity_(2013_film)',
    'hunger-games': 'The_Hunger_Games_(film)', 'catching-fire': 'The_Hunger_Games:_Catching_Fire',
    'iron-man-3': 'Iron_Man_3', 'world-war-z': 'World_War_Z_(film)',
    'district-9': 'District_9', 'hangover': 'The_Hangover', 'hugo': 'Hugo_(film)',
    'super-8': 'Super_8_(2011_film)', 'war-worlds': 'War_of_the_Worlds_(2005_film)',
    'avengers': 'The_Avengers_(2012_film)',
    'sherry-lansing': 'Sherry_Lansing', 'brad-grey': 'Brad_Grey',
    'rich-ross': 'Rich_Ross', 'alan-horn': 'Alan_F._Horn',
    'amy-pascal':'Amy_Pascal','tom-rothman':'Tom_Rothman','kevin-feige':'Kevin_Feige',
    'robert-shaye':'Robert_Shaye','shonda-rhimes':'Shonda_Rhimes',
    'steven-spielberg':'Steven_Spielberg','christopher-nolan':'Christopher_Nolan',
    'tom-cruise':'Tom_Cruise','leonardo-dicaprio':'Leonardo_DiCaprio','meryl-streep':'Meryl_Streep',
    'denzel-washington':'Denzel_Washington','julia-roberts':'Julia_Roberts','tom-hanks':'Tom_Hanks',
    'alfred-hitchcock':'Alfred_Hitchcock','marilyn-monroe':'Marilyn_Monroe','james-stewart':'James_Stewart',
    'jennifer-lawrence':'Jennifer_Lawrence','samuel-l-jackson':'Samuel_L._Jackson',
    'greta-gerwig':'Greta_Gerwig','shah-rukh-khan':'Shah_Rukh_Khan','jackie-chan':'Jackie_Chan',
}

def main():
    ASSETS.mkdir(parents=True, exist_ok=True)
    manifest_path = ASSETS / 'manifest.json'
    manifest = json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
    # D23 provides the portrait used with its own executive biography.
    if 'rich-ross' not in manifest:
        url = 'https://d23.com/app/uploads/2015/07/ross-rich-1180x600-1180x600.jpg'
        try:
            raw = fetch(url)
            (ASSETS/'rich-ross.jpg').write_bytes(raw)
            manifest['rich-ross'] = {'path':'assets/rich-ross.jpg','page':'https://d23.com/a-to-z/ross-rich/',
                'url':url,'filePage':'https://d23.com/a-to-z/ross-rich/','title':'Rich Ross',
                'kind':'press_photo','credit':'Photo © Disney / D23; source: Disney’s executive biography.',
                'retrieved':'2026-11-12','sha256':hashlib.sha256(raw).hexdigest()}
            print('rich-ross official D23 portrait',len(raw))
        except Exception as error:
            print('UNAVAILABLE rich-ross official portrait',str(error))
    for slug, title in SUBJECTS.items():
        if slug in manifest and (ROOT/'public'/manifest[slug]['path']).exists():
            continue
        page = 'https://en.wikipedia.org/wiki/' + urllib.parse.quote(title)
        try:
            time.sleep(1.5)
            summary_url = 'https://en.wikipedia.org/api/rest_v1/page/summary/' + urllib.parse.quote(title)
            try:
                summary_raw = fetch(summary_url)
            except urllib.error.HTTPError as error:
                if error.code != 429:
                    raise
                time.sleep(min(20, max(5, int(error.headers.get('Retry-After', 5)))))
                summary_raw = fetch(summary_url)
            summary = json.loads(summary_raw)
            thumbnail = summary.get('thumbnail')
            if not thumbnail:
                raise ValueError('No thumbnail provided by the source')
            url = thumbnail['source'].split('?')[0]
            try:
                raw = fetch(url)
            except urllib.error.HTTPError as error:
                if error.code != 429:
                    raise
                time.sleep(min(20, max(5, int(error.headers.get('Retry-After', 5)))))
                raw = fetch(url)
            ext = '.png' if raw[:8] == b'\x89PNG\r\n\x1a\n' else '.jpg'
            filename = slug + ext
            (ASSETS / filename).write_bytes(raw)
            original = summary.get('originalimage', {}).get('source', url).split('?')[0]
            file_title = urllib.parse.unquote(original.rsplit('/', 1)[-1])
            is_commons = '/commons/' in original
            file_page = ('https://commons.wikimedia.org/wiki/File:' if is_commons else 'https://en.wikipedia.org/wiki/File:') + urllib.parse.quote(file_title)
            item = {'path': 'assets/' + filename, 'page': page, 'url': url, 'filePage': file_page,
                    'title': summary.get('title', title), 'width': thumbnail.get('width'), 'height': thumbnail.get('height'),
                    'retrieved': '2026-11-12', 'sha256': hashlib.sha256(raw).hexdigest(),
                    'credit': 'Poster artwork © respective rights holders; source: Wikipedia.' if not is_commons else 'Wikimedia Commons; see individual file license and author.',
                    'kind': 'commons_photo' if is_commons else 'copyrighted_poster'}
            if is_commons:
                query = urllib.parse.urlencode({'action':'query', 'format':'json', 'prop':'imageinfo', 'iiprop':'extmetadata', 'titles':'File:'+file_title})
                try:
                    meta = json.loads(fetch('https://commons.wikimedia.org/w/api.php?' + query))
                    pages = list(meta['query']['pages'].values())
                    item['licenseMetadata'] = pages[0]['imageinfo'][0]['extmetadata']
                except Exception as error:
                    item['metadataError'] = str(error)
            manifest[slug] = item
            print(slug, filename, len(raw), item['kind'])
        except Exception as error:
            print('UNAVAILABLE', slug, str(error))
        time.sleep(.1)
    (ASSETS / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    (ASSETS / 'manifest.js').write_text('window.LabMedia = ' + json.dumps(manifest,ensure_ascii=False,separators=(',',':')) + ';\n')

if __name__ == '__main__':
    main()
