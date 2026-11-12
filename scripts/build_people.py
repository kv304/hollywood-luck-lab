"""Derive filmography profiles from credited roles, never executive tenure guesses."""
import collections
import csv
import json
from pathlib import Path
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/data'
FEATURED=['Steven Spielberg','Christopher Nolan','Tom Cruise','Leonardo DiCaprio','Meryl Streep',
    'Denzel Washington','Julia Roberts','Tom Hanks','Samuel L. Jackson','Jennifer Lawrence',
    'Alfred Hitchcock','James Stewart','Marilyn Monroe','Marlon Brando','Audrey Hepburn',
    'Clint Eastwood','Robert De Niro','Al Pacino','Harrison Ford','Sigourney Weaver',
    'Drew Barrymore','Will Smith','Brad Pitt','Sandra Bullock','Johnny Depp','Nicolas Cage',
    'James Cameron','Martin Scorsese','Quentin Tarantino','Spike Lee','Kathryn Bigelow',
    'Greta Gerwig','Sofia Coppola','Wes Anderson','Denis Villeneuve','Ang Lee','Bong Joon-ho',
    'Shah Rukh Khan','Aamir Khan','Amitabh Bachchan','Jackie Chan','Michelle Yeoh','Zhang Ziyi',
    'Margot Robbie','Emma Stone','Scarlett Johansson','Ryan Gosling','Viola Davis','Dwayne Johnson']

def build():
    catalog=json.loads((OUT/'research-catalog.json').read_text())
    people={}
    for movie in catalog:
        for role,key in [('Actor','cast'),('Director','directors')]:
            for person in movie[key]:
                p=people.setdefault(str(person['id']),{'id':str(person['id']),'name':person['name'],'roles':set(),'films':{}})
                p['roles'].add(role)
                film=p['films'].setdefault(movie['id'],{k:movie[k] for k in ['id','title','year','date','budget','gross','genres']})
                film.setdefault('roles',[]).append(role)
    profiles=[]
    for p in people.values():
        films=sorted(p['films'].values(),key=lambda m:(m['year'],m['title']))
        valid=[m for m in films if m['budget']>0 and m['gross']>0]
        if len(valid)<3 and p['name'] not in FEATURED:continue
        for m in films:m['multiple']=round(m['gross']/m['budget'],4) if m['budget']>0 and m['gross']>0 else None
        p.update(roles=sorted(p['roles']),films=films,covered=len(valid),missing=len(films)-len(valid),
            firstYear=min(m['year'] for m in films),lastYear=max(m['year'] for m in films),
            gross=sum(m['gross'] for m in valid),medianMultiple=float(np.median([m['multiple'] for m in valid])) if valid else None,
            featured=FEATURED.index(p['name']) if p['name'] in FEATURED else 999)
        profiles.append(p)
    profiles.sort(key=lambda p:(p['featured'],-p['covered'],p['name']))
    payload={'source':'https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata','snapshot':'1916–2017; selected TMDB 5000 snapshot, not complete careers',
        'scope':'Directors and first eight billed cast members; profiles require three films with positive budget and gross, or a featured name.',
        'people':profiles,'catalogRows':len(catalog)}
    (OUT/'people-data.js').write_text('window.PeopleLabData = '+json.dumps(payload,ensure_ascii=False,separators=(',',':'))+';\n')
    (OUT/'people.json').write_text(json.dumps(payload,ensure_ascii=False,separators=(',',':'))+'\n')
    with (OUT/'film-credits.csv').open('w') as f:
        writer=csv.writer(f);writer.writerow(['person_id','person','role','tmdb_id','title','year','budget_usd','reported_gross_usd','gross_budget_multiple'])
        for p in profiles:
            for m in p['films']:
                for role in m['roles']:writer.writerow([p['id'],p['name'],role,m['id'],m['title'],m['year'],m['budget'],m['gross'],m['multiple']])
    print(len(profiles),'people;',sum(p['covered'] for p in profiles),'covered person-film credits')

if __name__=='__main__':build()
