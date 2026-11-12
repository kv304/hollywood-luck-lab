# Saved versions

## v0.1.0 — Original prototype — November 12, 2026

Four fictional executives, a reproducible probability sandbox, CSV exports, and three independently sourced executive case files. Git tag `v0.1.0` and ZIP in `artifacts/hollywood-luck-lab-v0.1.0.zip`. A playable copy is also kept at `public/classic/index.html`.

## v0.2.0-data — Audited historical data and baseline

Publisher snapshot and SHA-256 provenance; 1,726 retained records from 1,794 input rows; 51 ambiguous financial signatures and 17 missing financial rows excluded. Logistic baseline trained on 1,188 films through 2008 and tested on 538 from 2009–2013. Default 2.5× threshold holdout Brier score: 0.2540; constant baseline: 0.2543. Five checks cover chronology, identity collisions, labels, reproducibility, and evaluation. The original UI is still available in this checkpoint.

## Restore or inspect a version

Every working milestone receives a Git tag and a ZIP. To inspect without replacing current work, extract the desired ZIP into a separate folder and serve its `public` directory. To restore a milestone into a new Git branch after saving current changes, use `git switch -c restore-v0.1.0 v0.1.0`. Do not use a hard reset. The version selector in the site links the playable original; ZIP files preserve the exact full source of each milestone.
