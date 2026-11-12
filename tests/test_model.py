import importlib.util
import json
from pathlib import Path
import unittest
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('build_model', ROOT / 'scripts/build_model.py')
model_code = importlib.util.module_from_spec(spec)
spec.loader.exec_module(model_code)

class HistoricalModelChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.report = json.loads((ROOT/'public/data/model-report.json').read_text())
        cls.train = json.loads((ROOT/'public/data/training-movies.json').read_text())
        cls.test = json.loads((ROOT/'public/data/movies.json').read_text())

    def test_temporal_holdout_and_identity_separation(self):
        self.assertLess(max(r['year'] for r in self.train), min(r['year'] for r in self.test))
        self.assertFalse({r['id'] for r in self.train} & {r['id'] for r in self.test})
        self.assertEqual(len(self.train)+len(self.test)+self.report['excludedRows'], self.report['rawRows'])

    def test_ambiguous_remakes_are_excluded_not_silently_corrected(self):
        excluded = {r['id'] for r in self.report['exclusions']}
        self.assertTrue({'tt0848228','tt0118661','tt2294629','tt1323045'} <= excluded)
        self.assertFalse(excluded & {r['id'] for r in self.train+self.test})

    def test_labels_are_reported_gross_multiple_not_profit(self):
        carter = next(r for r in self.test if r['id']=='tt0401729')
        self.assertAlmostEqual(carter['multiple'], 282778100 / 275000000)
        self.assertLess(carter['multiple'],2.5)
        self.assertGreater(carter['multiple'],1)

    def test_rebuild_and_exported_predictions_match(self):
        for threshold in [1.,2.5,5.]:
            fitted = model_code.fit(self.train,threshold)
            saved = self.report['models'][str(threshold)]
            np.testing.assert_allclose(fitted['weights'],saved['weights'],atol=1e-10)
            np.testing.assert_allclose(model_code.predict(saved,self.test),[r['legacyProbabilities'][str(threshold)] for r in self.test],atol=1e-8)
            self.assertTrue(all(0 < r['probabilities'][str(threshold)] < 1 for r in self.test))

    def test_metrics_and_cohorts_are_reproducible(self):
        for key, saved in self.report['models'].items():
            labels=[r['multiple']>=float(key) for r in self.test]
            probabilities=[r['legacyProbabilities'][key] for r in self.test]
            self.assertAlmostEqual(model_code.metrics(labels,probabilities)['brier'],saved['evaluation']['model']['brier'],places=8)
            self.assertEqual(sum(r['n'] for r in saved['cohorts']),len(self.train))
            self.assertEqual(sum(r['n'] for r in saved['calibration']),len(self.test))
            self.assertEqual(len(saved['weights']),3)

if __name__=='__main__':
    unittest.main()
