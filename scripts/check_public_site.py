"""Check portable static assets and links without starting the app or needing credentials."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json

ROOT=Path(__file__).resolve().parents[1]
PUBLIC=ROOT/'public'
class References(HTMLParser):
    def __init__(self):
        super().__init__();self.refs=[];self.ids=set()
    def handle_starttag(self, tag, attrs):
        values=dict(attrs)
        if values.get('id'):self.ids.add(values['id'])
        for key in ['href','src']:
            if values.get(key):self.refs.append(values[key])

def main():
    broken=[]
    for page in PUBLIC.rglob('*.html'):
        parsed=References();parsed.feed(page.read_text())
        for ref in parsed.refs:
            parts=urlsplit(ref)
            if parts.scheme or parts.netloc or not parts.path:continue
            target=(page.parent/unquote(parts.path)).resolve()
            if not target.is_relative_to(PUBLIC.resolve()) or not target.is_file():broken.append((str(page.relative_to(ROOT)),ref))
    if broken:raise SystemExit('Broken public assets/links: '+repr(broken))
    report=json.loads((PUBLIC/'data/model-report.json').read_text())
    movies=json.loads((PUBLIC/'data/movies.json').read_text())
    people=json.loads((PUBLIC/'data/people.json').read_text())['people']
    assert report['holdout']['n']==len(movies)==538
    assert len(people)==2671
    assert (PUBLIC/'work-sample/Karan_Verma_Hollywood_Luck_Lab_Work_Sample.pdf').read_bytes().startswith(b'%PDF')
    print('Static assets and relative links resolve, including under a GitHub Pages repository prefix.')
    print('Portfolio counts match the exported evaluation and career datasets.')

if __name__=='__main__':main()
