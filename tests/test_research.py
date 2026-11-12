"""Check leakage boundaries, independently refit winners, and verify displayed metrics."""
import csv
import json
from pathlib import Path
import sys
import unittest
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'scripts'))
import build_research as research

class ResearchChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report=json.loads((ROOT/'public/data/model-report.json').read_text())
        cls.test=json.loads((ROOT/'public/data/movies.json').read_text())
        cls.catalog=research.load_catalog()
        _,cls.rows,_=research.clean_rows()
        research.enrich(cls.rows,cls.catalog)
        cls.train=[r for r in cls.rows if r['year']<=2008]

    def test_independent_refit_and_all_displayed_metrics(self):
        raw=[]
        for key,model in self.report['enhancedModels'].items():
            threshold=float(key)
            x,_=research.feature_rows(self.train,self.catalog,threshold)
            xt,_=research.feature_rows(self.test,self.catalog,threshold)
            clf=research.candidates()[model['name']]
            clf.fit(x,[r['multiple']>=threshold for r in self.train])
            p=clf.predict_proba(xt)[:,1]
            np.testing.assert_allclose(p,[r['rawProbabilities'][key] for r in self.test],atol=1e-8)
            _,names=research.feature_rows(self.train,self.catalog,threshold)
            for driver in self.test[0]['explanations'][key]:
                j=names.index(driver['feature'])
                changed=xt[:1].copy();changed[0,j]=np.median(x,axis=0)[j]
                difference=p[0]-clf.predict_proba(changed)[0,1]
                self.assertAlmostEqual(difference,driver['difference'],places=4)
            raw.append(p)
            selected=min(model['validation'],key=lambda name:model['validation'][name]['brier'])
            self.assertEqual(selected,model['name'])
            metrics=research.metrics([r['multiple']>=threshold for r in self.test],[r['probabilities'][key] for r in self.test])
            for name,value in metrics.items():self.assertAlmostEqual(value,model['evaluation']['model'][name],places=8)
            self.assertEqual(sum(b['n'] for b in model['calibration']),len(self.test))
        projected=[research.consistent_probabilities(values) for values in np.array(raw).T]
        np.testing.assert_allclose(projected,[[r['probabilities'][k] for k in ['1.0','2.5','5.0']] for r in self.test],atol=1e-8)

    def test_future_outcomes_cannot_change_features(self):
        before,_=research.feature_rows(self.test[:5],self.catalog,2.5)
        altered=[{**r,'gross':10**12 if r['year']>=2009 else r['gross']} for r in self.catalog]
        after,_=research.feature_rows(self.test[:5],altered,2.5)
        np.testing.assert_array_equal(before,after)
        # With a 2004 cutoff, even validation-period outcomes must not enter history.
        before,_=research.feature_rows(self.train[-5:],self.catalog,2.5,history_limit=2004)
        altered=[{**r,'gross':10**12 if r['year']>=2005 else r['gross']} for r in self.catalog]
        after,_=research.feature_rows(self.train[-5:],altered,2.5,history_limit=2004)
        np.testing.assert_array_equal(before,after)

    def test_probability_order_comparables_and_unique_joins(self):
        train_ids={r['id'] for r in self.train}
        for r in self.test:
            p=r['probabilities']
            self.assertTrue(1>=p['1.0']>=p['2.5']>=p['5.0']>=0)
            self.assertTrue(all(c['year']<=2008 and c['id'] in train_ids for c in r['comparables']))
            self.assertEqual(len({c['id'] for c in r['comparables']}),3)
        audit=json.loads((ROOT/'public/data/metadata-join-audit.json').read_text())
        self.assertEqual(len(audit),len({a['imdb'] for a in audit}))
        self.assertEqual(len(audit),self.report['research']['matchedRows'])

    def test_people_aggregates_use_known_values_only(self):
        people=json.loads((ROOT/'public/data/people.json').read_text())['people']
        for p in people:
            valid=[f for f in p['films'] if f['multiple'] is not None]
            self.assertEqual(len(valid),p['covered'])
            self.assertEqual(sum(f['gross'] for f in valid),p['gross'])
            self.assertEqual(len(p['films']),len({f['id'] for f in p['films']}))
            for f in valid:self.assertAlmostEqual(f['multiple'],f['gross']/f['budget'],places=3)

if __name__=='__main__':unittest.main()
