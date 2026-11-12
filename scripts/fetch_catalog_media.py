"""Batch Wikipedia page-image lookups and cache small thumbnails with provenance."""
import argparse
import hashlib
import json
import time
import urllib.parse
import urllib.error
from fetch_sources import fetch
from fetch_media import SUBJECTS, main as fetch_subjects
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
ALIASES={'Dredd 3D':'Dredd','The Hangover part 3':'The Hangover Part III',"What's Your Number":"What's Your Number?",'The Pirates! Band of Misfits':'The Pirates! In an Adventure with Scientists!','Sex and the city 2':'Sex and the City 2','Micmacs (Micmacs à tire-larigot)':'Micmacs (film)'}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--limit',type=int,default=600)
    parser.add_argument('--cache-limit',type=int,default=0,help='Additional local image downloads after metadata lookup; 0 keeps verified source URLs.')
    parser.add_argument('--fallback',action='store_true',help='Use exact-year REST descriptions for remaining pages with non-flat year categories.')
    args=parser.parse_args()
    assets=ROOT/'public/assets'
    path=assets/'manifest.json'
    manifest=json.loads(path.read_text())
    movies=json.loads((ROOT/'public/data/movies.json').read_text())
    def save():
        path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
        (assets/'manifest.js').write_text('window.LabMedia = '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
    remaining=[m for m in movies if not manifest.get(m['id'],{}).get('identityVerified')][:args.limit]
    for suffix in [' (YEAR film)', ' (film)', '']:
        for start in range(0,len(remaining),40):
            batch=remaining[start:start+40]
            titles={ALIASES.get(m['title'],m['title'])+suffix.replace('YEAR',str(m['year'])):m for m in batch if not manifest.get(m['id'],{}).get('identityVerified')}
            if not titles:continue
            query=urllib.parse.urlencode({'action':'query','format':'json','redirects':1,'prop':'pageimages|categories','cllimit':'max','clcategories':'|'.join('Category:'+str(y)+' films' for y in {m['year'] for m in batch}),'piprop':'thumbnail|name|original','pilicense':'any','pithumbsize':300,'titles':'|'.join(titles),'maxlag':5})
            try:
                payload=json.loads(fetch('https://en.wikipedia.org/w/api.php?'+query))
                redirects={r['from']:r['to'] for r in payload.get('query',{}).get('redirects',[])}
                normalized={r['from']:r['to'] for r in payload.get('query',{}).get('normalized',[])}
                pages={p['title']:p for p in payload.get('query',{}).get('pages',{}).values()}
                for title,m in titles.items():
                    resolved=normalized.get(title,title);resolved=redirects.get(resolved,resolved)
                    p=pages.get(resolved,{})
                    thumb=p.get('thumbnail')
                    if not thumb:continue
                    categories={c['title'] for c in p.get('categories',[])}
                    if 'Category:'+str(m['year'])+' films' not in categories:continue
                    original=p.get('original',{})
                    url=original['source'] if original.get('width',9999)<=1200 and original.get('height',9999)<=1600 else thumb['source']
                    manifest[m['id']]={'title':m['title'],'path':url,'url':url,
                        'page':'https://en.wikipedia.org/wiki/'+urllib.parse.quote(resolved.replace(' ','_')),
                        'filePage':'https://en.wikipedia.org/wiki/File:'+urllib.parse.quote(p['pageimage']),
                        'credit':'Film reference image © respective rights holders; Wikipedia page image.',
                        'kind':'copyrighted_poster','identityVerified':True,'verification':'Release-year film category on source page','year':m['year'],'cached':False,'retrieved':'2026-11-12'}
                    save()

                print('Batch',start,'cached',sum(m['id'] in manifest for m in movies),flush=True)
            except Exception as error:
                print('UNAVAILABLE batch',start,str(error),flush=True)
                if '429' in str(error):time.sleep(30)
            time.sleep(1)
    if args.fallback:
        for movie in movies:
            if manifest.get(movie['id'],{}).get('identityVerified'):continue
            try:
                title=ALIASES.get(movie['title'],movie['title']).replace(' ','_')
                summary=json.loads(fetch('https://en.wikipedia.org/api/rest_v1/page/summary/'+urllib.parse.quote(title)))
                description=summary.get('description','').lower()
                if str(movie['year']) not in description or 'film' not in description:continue
                thumb=summary.get('thumbnail')
                if not thumb:continue
                url=thumb['source'].split('?')[0]
                original=summary.get('originalimage',{}).get('source',url).split('?')[0]
                filename=urllib.parse.unquote(original.rsplit('/',1)[-1])
                manifest[movie['id']]={'title':movie['title'],'path':url,'url':url,
                    'page':summary['content_urls']['desktop']['page'],
                    'filePage':('https://commons.wikimedia.org/wiki/File:' if '/commons/' in original else 'https://en.wikipedia.org/wiki/File:')+urllib.parse.quote(filename),
                    'credit':'Film reference artwork; see linked source file for rights and attribution.',
                    'kind':'copyrighted_poster','identityVerified':True,'verification':'Exact film year in source page description: '+description,
                    'year':movie['year'],'cached':False,'retrieved':'2026-11-12'}
                save()
                print('Resolved',movie['title'],flush=True)
            except Exception as error:
                print('UNAVAILABLE fallback',movie['title'],str(error),flush=True)
                if isinstance(error,urllib.error.HTTPError) and error.code==429:
                    time.sleep(max(10,int(error.headers.get('Retry-After','30'))))
            time.sleep(1.5)
    pending=[m for m in movies if manifest.get(m['id'],{}).get('identityVerified') and manifest[m['id']]['path'].startswith('https://')][:args.cache_limit]
    for movie in pending:
        item=manifest[movie['id']]
        try:
            raw=fetch(item['url'])
            ext='.png' if raw[:8]==b'\x89PNG\r\n\x1a\n' else '.jpg'
            filename=movie['id']+ext
            (assets/filename).write_bytes(raw)
            item.update(path='assets/'+filename,cached=True,sha256=hashlib.sha256(raw).hexdigest())
            save()
        except urllib.error.HTTPError as error:
            if error.code==429:
                print('Cache paused at source rate limit; source URLs retained.',flush=True)
                break
            print('UNAVAILABLE local cache',movie['title'],str(error),flush=True)
        time.sleep(1.5)
    print('Catalog imagery',sum(m['id'] in manifest for m in movies),'/',len(movies),flush=True)

if __name__=='__main__':main()
