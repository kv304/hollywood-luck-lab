"""Enrich the unchanged audited film sample; select on 2005–08, test on 2009–13.

No popularity, votes, reviews, eventual revenue, or future career results enter X.
Historical credit aggregates exclude the film's whole release year and freeze at 2008.
"""
import collections
import csv
import hashlib
import io
import json
import re
import unicodedata
from pathlib import Path
import numpy as np
from sklearn.ensemble import RandomForestClassifier, HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import make_pipeline
from build_model import clean_rows, fit, predict, metrics

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/raw/research'
OUT = ROOT / 'public/data'

def normal(s):
    return re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower())

def load_catalog():
    credits = {int(r['movie_id']): r for r in csv.DictReader(io.StringIO((RAW/'tmdb_5000_credits.csv').read_text()))}
    catalog = []
    for r in csv.DictReader(io.StringIO((RAW/'tmdb_5000_movies.csv').read_text())):
        if not r['release_date']:
            continue
        c = credits[int(r['id'])]
        cast, crew = json.loads(c['cast']), json.loads(c['crew'])
        catalog.append({'id': int(r['id']), 'title': r['title'], 'originalTitle': r['original_title'],
            'date': r['release_date'], 'year': int(r['release_date'][:4]), 'month': int(r['release_date'][5:7]),
            'genres': [g['name'] for g in json.loads(r['genres'])], 'language': r['original_language'],
            'companies': json.loads(r['production_companies']),
            'cast': [{'id':p['id'], 'name':p['name']} for p in sorted(cast,key=lambda p:p['order'])[:8]],
            'directors': [{'id':p['id'], 'name':p['name']} for p in crew if p['job']=='Director'],
            'budget': int(r['budget']), 'gross': int(r['revenue'])})
    return catalog

def enrich(rows, catalog):
    index = collections.defaultdict(list)
    for c in catalog:
        for title in {normal(c['title']), normal(c['originalTitle'])}:
            index[(title, c['year'])].append(c)
    audit = []
    for r in rows:
        candidates = {c['id']:c for c in index[(normal(r['title']),r['year'])]}
        if len(candidates)==1:
            c = next(iter(candidates.values()))
            r['metadata'] = {k:c[k] for k in ['id','month','genres','language','companies','cast','directors']}
            audit.append({'imdb':r['id'],'tmdb':c['id'],'title':r['title'],'rule':'unique normalized title + exact year',
                'budgetRatio':c['budget']/r['budget'] if c['budget'] else None, 'grossRatio':c['gross']/r['gross'] if c['gross'] else None})
    return audit

def feature_rows(rows, catalog, threshold, history_limit=2008):
    usable = [c for c in catalog if c['budget']>0 and c['gross']>0]
    result=[]
    for r in rows:
        m=r.get('metadata',{})
        prior=[c for c in usable if c['year']<min(r['year'],history_limit+1)]
        global_rate=(sum(c['gross']/c['budget']>=threshold for c in prior)+2)/(len(prior)+4)
        f={'Budget (log USD)':float(np.log(r['budget'])), 'Release year':r['year'],
            'Metadata available':int(bool(m)), 'English language':int(m.get('language')=='en'),
            'Release month (sin)':float(np.sin(m.get('month',6)/12*2*np.pi)),
            'Release month (cos)':float(np.cos(m.get('month',6)/12*2*np.pi))}
        for g in sorted({g for c in catalog for g in c['genres']}):
            f['Genre: '+g]=int(g in m.get('genres',[]))
        for key,label,limit in [('directors','Director history',None),('cast','Lead cast history',3),('companies','Production company history',None)]:
            ids={p['id'] for p in m.get(key,[])[:limit]}
            history=[c for c in prior if ids & {p['id'] for p in c[key][:limit]}]
            # Shrink sparse histories toward the earlier catalog rate; never use a future film.
            rate=(sum(c['gross']/c['budget']>=threshold for c in history)+10*global_rate)/(len(history)+10)
            f[label]=rate
            f[label+' coverage']=float(np.log1p(len(history)))
        result.append(f)
    names=list(result[0])
    return np.array([[f[k] for k in names] for f in result]),names

def candidates():
    return {
        'Richer logistic (C=0.1)':make_pipeline(StandardScaler(),LogisticRegression(C=.1,max_iter=2000)),
        'Richer logistic (C=1)':make_pipeline(StandardScaler(),LogisticRegression(C=1,max_iter=2000)),
        'Forest (leaf 15)':RandomForestClassifier(n_estimators=250,min_samples_leaf=15,max_features=.8,random_state=502,n_jobs=2),
        'Forest (leaf 30)':RandomForestClassifier(n_estimators=250,min_samples_leaf=30,max_features=.8,random_state=502,n_jobs=2),
        'Boosted trees (depth 2)':HistGradientBoostingClassifier(max_iter=100,max_depth=2,l2_regularization=10,learning_rate=.05,random_state=502),
        'Boosted trees (depth 3)':HistGradientBoostingClassifier(max_iter=100,max_depth=3,l2_regularization=10,learning_rate=.05,random_state=502),
    }

def consistent_probabilities(values):
    """Least-squares decreasing projection: a harder target cannot be likelier."""
    blocks=[]
    for value in values:
        blocks.append([float(value),1])
        while len(blocks)>1 and blocks[-2][0] < blocks[-1][0]:
            b,n=blocks.pop();a,m=blocks.pop()
            blocks.append([(a*m+b*n)/(m+n),m+n])
    return [value for value,n in blocks for _ in range(n)]

def build():
    _,rows,_=clean_rows()
    catalog=load_catalog()
    audit=enrich(rows,catalog)
    train=[r for r in rows if r['year']<=2008]
    test=[r for r in rows if r['year']>=2009]
    selection=np.array([r['year']<=2004 for r in train])
    report=json.loads((OUT/'model-report.json').read_text())
    report['research']={'source':'https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata',
        'license':'TMDB terms; publisher labels Other (specified in description), NOT CC0.',
        'catalogRows':len(catalog),'matchedRows':len(audit),'matchedHoldout':sum('metadata' in r for r in test),
        'joinRule':'Unique normalized title and exact release year. Financial targets remain FiveThirtyEight values.',
        'historyRule':'Strictly earlier release years only, frozen after 2008. Same-year films excluded.',
        'selection':'Fit through 2004; choose minimum Brier error on 2005–08. Refit through 2008; evaluate once on 2009–13.',
        'caveat':'Development already examined this historical test set for v2. This is not a pristine prospective external benchmark. Source metadata and budgets were assembled after release; release-month and final credits may not have been available at greenlight.',
        'excludedFeatures':['gross','multiple','popularity','vote average','vote count','reviews','future credits','executive identity'],
        'files':json.loads((RAW/'provenance.json').read_text())}
    enhanced={}
    for threshold in [1.,2.5,5.]:
        key=str(threshold)
        x,names=feature_rows(train,catalog,threshold)
        xv,_=feature_rows(train,catalog,threshold,history_limit=2004)
        xt,_=feature_rows(test,catalog,threshold)
        y=np.array([r['multiple']>=threshold for r in train],dtype=int)
        yt=np.array([r['multiple']>=threshold for r in test],dtype=int)
        models=candidates()
        validation={}
        for name,clf in models.items():
            clf.fit(x[selection],y[selection])
            validation[name]=metrics(y[~selection],clf.predict_proba(xv[~selection])[:,1])
        name=min(validation,key=lambda k:validation[k]['brier'])
        clf=models[name]
        clf.fit(x,y)
        p=clf.predict_proba(xt)[:,1]
        base=report['models'][key]
        center=np.median(x,axis=0)
        # Single-feature neutralization explains model sensitivity, not causal impact.
        changes=[]
        for j in range(len(names)):
            modified=xt.copy(); modified[:,j]=center[j]
            changes.append(p-clf.predict_proba(modified)[:,1])
        changes=np.array(changes).T
        for i,r in enumerate(test):
            r['legacyProbabilities']=r.get('legacyProbabilities',{})
            r['legacyProbabilities'][key]=round(float(predict(base,[r])[0]),8)
            r.setdefault('probabilities',{})[key]=round(float(p[i]),8)
            drivers=sorted(range(len(names)),key=lambda j:abs(changes[i,j]),reverse=True)[:3]
            r.setdefault('explanations',{})[key]=[{'feature':names[j],'difference':round(float(changes[i,j]),5),'value':round(float(xt[i,j]),5)} for j in drivers]
        calibration=[]
        for j in range(5):
            mask=(p>=j/5)&((p<(j+1)/5) if j<4 else p<=1)
            if mask.any():calibration.append({'low':j/5,'high':(j+1)/5,'n':int(mask.sum()),'predicted':float(p[mask].mean()),'observed':float(yt[mask].mean())})
        enhanced[key]={'name':name,'validation':validation,'selectionTrain':int(selection.sum()),'selectionValidation':int((~selection).sum()),
            'features':names,'evaluation':{'model':metrics(yt,p),'legacy':base['evaluation']['model'],'baseline':base['evaluation']['baseline']},'calibration':calibration,
            'sensitivityMethod':'Change in predicted probability when one feature is replaced with its training median, holding other inputs fixed. Effects are not additive, causal, or uncertainty intervals.'}
        print(key,name,json.dumps(enhanced[key]['evaluation']),flush=True)
    # Three independent target models must form a coherent survival probability curve.
    keys=['1.0','2.5','5.0']
    adjusted=0
    for r in test:
        before=[r['probabilities'][k] for k in keys]
        after=consistent_probabilities(before)
        r['rawProbabilities']=dict(r['probabilities'])
        if before!=after:adjusted+=1
        r['probabilities']={k:round(v,8) for k,v in zip(keys,after)}
    report['research']['probabilityConsistency']={'method':'Equal-weight decreasing isotonic projection across 1×, 2.5×, and 5×, after independent model selection. No outcome is used in this step.','adjustedFilms':adjusted}
    for key in keys:
        chosen=enhanced[key]
        chosen['rawEvaluation']=chosen['evaluation']['model']
        y=np.array([r['multiple']>=float(key) for r in test],dtype=int)
        p=np.array([r['probabilities'][key] for r in test])
        chosen['evaluation']['model']=metrics(y,p)
        delta=(np.array([r['legacyProbabilities'][key] for r in test])-y)**2-(p-y)**2
        rng=np.random.default_rng(502)
        resampled=[float(delta[rng.integers(0,len(delta),len(delta))].mean()) for _ in range(2000)]
        chosen['pairedBootstrap']={'metric':'Brier error improvement versus original; positive favors richer model',
            'mean':float(delta.mean()),'low':float(np.quantile(resampled,.025)),'high':float(np.quantile(resampled,.975)),
            'resamples':2000,'seed':502,'caveat':'Film-level resampling treats rows as independent; shared franchises and teams can violate this. It does not correct sample selection or development reuse.'}
        chosen['calibration']=[]
        for j in range(5):
            mask=(p>=j/5)&((p<(j+1)/5) if j<4 else p<=1)
            if mask.any():chosen['calibration'].append({'low':j/5,'high':(j+1)/5,'n':int(mask.sum()),'predicted':float(p[mask].mean()),'observed':float(y[mask].mean())})
    # Comparable films use earlier budget and genre, not future outcomes or outcome proximity.
    for r in test:
        genres=set(r.get('metadata',{}).get('genres',[]))
        ordered=sorted(train,key=lambda a: abs(np.log(a['budget']/r['budget'])) + (1-len(genres&set(a.get('metadata',{}).get('genres',[])))/max(1,len(genres|set(a.get('metadata',{}).get('genres',[])))))*2)
        r['comparables']=[{'id':a['id'],'title':a['title'],'year':a['year'],'budget':a['budget'],'multiple':round(a['multiple'],2)} for a in ordered[:3]]
    report['enhancedModels']=enhanced
    (OUT/'model-report.json').write_text(json.dumps(report,indent=2,allow_nan=False)+'\n')
    (OUT/'movies.json').write_text(json.dumps(test,ensure_ascii=False,separators=(',',':'))+'\n')
    (OUT/'model-data.js').write_text('window.MovieLabData = '+json.dumps({'report':report,'movies':test},ensure_ascii=False,separators=(',',':'))+';\n')
    (OUT/'metadata-join-audit.json').write_text(json.dumps(audit,indent=2)+'\n')
    (OUT/'research-catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':'))+'\n')
    print('Catalog',len(catalog),'matched',len(audit),'test matched',report['research']['matchedHoldout'],flush=True)

if __name__=='__main__':
    build()
