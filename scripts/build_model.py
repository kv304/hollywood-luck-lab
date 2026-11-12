"""Reproducible historical baseline. Only budget and release year enter the model."""
import collections
import csv
import hashlib
import html
import json
from pathlib import Path
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'data/raw/movies.csv'

def clean_rows():
    rows = list(csv.DictReader(RAW.open()))
    signatures = collections.Counter((r['budget'], r['domgross'], r['intgross']) for r in rows)
    usable, exclusions = [], []
    for row in rows:
        reason = None
        try:
            budget, gross, domestic, year = int(row['budget']), int(row['intgross']), int(row['domgross']), int(row['year'])
            if budget <= 0 or gross <= 0 or domestic < 0:
                reason = 'missing_or_nonpositive_financial_value'
            elif signatures[(row['budget'], row['domgross'], row['intgross'])] > 1:
                reason = 'repeated_financial_signature_possible_identity_collision'
            elif gross < domestic:
                reason = 'reported_worldwide_less_than_domestic'
        except ValueError:
            reason = 'missing_or_nonpositive_financial_value'
        item = {'id': row['imdb'], 'title': html.unescape(row['title']), 'year': int(row['year'])}
        if reason:
            exclusions.append({**item, 'reason': reason})
        else:
            usable.append({**item, 'budget': budget, 'gross': gross, 'domestic': domestic, 'multiple': gross / budget})
    return rows, usable, exclusions

def features(rows):
    return np.array([[np.log(r['budget']), r['year']] for r in rows], dtype=float)

def sigmoid(x):
    return 1 / (1 + np.exp(-np.clip(x, -40, 40)))

def fit(train, threshold):
    raw = features(train)
    mean, scale = raw.mean(axis=0), raw.std(axis=0)
    x = np.column_stack([np.ones(len(train)), (raw - mean) / scale])
    y = np.array([r['multiple'] >= threshold for r in train], dtype=float)
    weights = np.zeros(x.shape[1])
    penalty = np.diag([0., 1., 1.])
    for _ in range(100):
        p = sigmoid(x @ weights)
        gradient = x.T @ (p - y) + penalty @ weights
        hessian = x.T @ ((p * (1-p))[:, None] * x) + penalty
        step = np.linalg.solve(hessian, gradient)
        weights -= step
        if np.max(np.abs(step)) < 1e-10:
            break
    return {'mean': mean.tolist(), 'scale': scale.tolist(), 'weights': weights.tolist(), 'baseRate': float(y.mean()), 'threshold': threshold}

def predict(model, rows):
    x = np.column_stack([np.ones(len(rows)), (features(rows) - model['mean']) / model['scale']])
    return sigmoid(x @ model['weights'])

def metrics(y, p):
    y, p = np.array(y, dtype=float), np.asarray(p, dtype=float)
    return {'brier': float(np.mean((p-y)**2)), 'logLoss': float(-np.mean(y*np.log(p)+(1-y)*np.log(1-p))), 'accuracy': float(np.mean((p>=.5)==y))}

def build():
    raw, rows, exclusions = clean_rows()
    train, holdout = [r for r in rows if r['year'] <= 2008], [r for r in rows if r['year'] >= 2009]
    models = {}
    for threshold in [1., 2.5, 5.]:
        model = fit(train, threshold)
        probabilities = predict(model, holdout)
        actual = [r['multiple'] >= threshold for r in holdout]
        model['evaluation'] = {'model': metrics(actual, probabilities), 'baseline': metrics(actual, np.repeat(model['baseRate'], len(holdout)))}
        model['calibration'] = []
        for lower in [0., .2, .4, .6, .8]:
            members = [i for i, p in enumerate(probabilities) if lower <= p < lower+.20000001]
            if members:
                model['calibration'].append({'low': lower, 'high': min(1, lower+.2), 'n': len(members), 'predicted': float(probabilities[members].mean()), 'observed': float(np.mean(np.array(actual)[members]))})
        model['cohorts'] = []
        for label, lo, hi in [('Under $20m', 0, 20000000), ('$20m–$75m', 20000000, 75000000), ('$75m+', 75000000, float('inf'))]:
            group = [r for r in train if lo <= r['budget'] < hi]
            hits = sum(r['multiple'] >= threshold for r in group)
            model['cohorts'].append({'label': label, 'low': lo, 'high': hi if np.isfinite(hi) else None, 'n': len(group), 'hits': hits, 'probability': (hits+2)/(len(group)+4)})
        models[str(threshold)] = model
        for row, probability in zip(holdout, probabilities):
            row.setdefault('probabilities', {})[str(threshold)] = round(float(probability), 8)
    report = {
        'retrieved': '2026-11-12', 'snapshotPeriod': '1970–2013', 'publisher': 'FiveThirtyEight',
        'source': 'https://github.com/fivethirtyeight/data/tree/master/bechdel', 'license': 'CC BY 4.0',
        'rawSha256': hashlib.sha256(RAW.read_bytes()).hexdigest(), 'rawRows': len(raw), 'cleanRows': len(rows),
        'excludedRows': len(exclusions), 'exclusionReasons': dict(collections.Counter(r['reason'] for r in exclusions)),
        'train': {'n': len(train), 'minYear': min(r['year'] for r in train), 'maxYear': 2008},
        'holdout': {'n': len(holdout), 'minYear': 2009, 'maxYear': 2013},
        'features': ['log nominal production budget in USD', 'release year'],
        'target': 'reported worldwide theatrical gross / production budget meets selected threshold',
        'financialField': 'Upstream intgross is used as total worldwide gross, not added to domgross. Checked against named-film examples; this snapshot is not a complete financial audit.',
        'exclusions': exclusions, 'models': models,
    }
    output = ROOT / 'public/data'
    output.mkdir(parents=True, exist_ok=True)
    (output / 'model-report.json').write_text(json.dumps(report, indent=2, allow_nan=False)+'\n')
    (output / 'movies.json').write_text(json.dumps(holdout, ensure_ascii=False, separators=(',',':'), allow_nan=False)+'\n')
    (output / 'training-movies.json').write_text(json.dumps(train, ensure_ascii=False, separators=(',',':'), allow_nan=False)+'\n')
    (output / 'model-data.js').write_text('window.MovieLabData = '+json.dumps({'report':report, 'movies':holdout},ensure_ascii=False,separators=(',',':'),allow_nan=False)+';\n')
    (output / 'LICENSE-data.txt').write_bytes((ROOT / 'data/raw/LICENSE-upstream.txt').read_bytes())
    print(json.dumps({k:v for k,v in report.items() if k not in ['exclusions','models']}, indent=2))
    print('2.5x holdout:', json.dumps(models['2.5']['evaluation'],indent=2))
    return report, rows, train, holdout

if __name__ == '__main__':
    build()
