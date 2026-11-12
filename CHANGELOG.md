# Saved versions

## v0.1.0 — Original prototype — November 12, 2026

Four fictional executives, a reproducible probability sandbox, CSV exports, and three independently sourced executive case files. Git tag `v0.1.0` and ZIP in `artifacts/hollywood-luck-lab-v0.1.0.zip`. A playable copy is also kept at `public/classic/index.html`.

## v0.2.0-data — Audited historical data and baseline

Publisher snapshot and SHA-256 provenance; 1,726 retained records from 1,794 input rows; 51 ambiguous financial signatures and 17 missing financial rows excluded. Logistic baseline trained on 1,188 films through 2008 and tested on 538 from 2009–2013. Default 2.5× threshold holdout Brier score: 0.2540; constant baseline: 0.2543. Five checks cover chronology, identity collisions, labels, reproducibility, and evaluation. The original UI is still available in this checkpoint.

## v0.2.0 — Entertainment redesign and real-data game

Coral/violet/mint/yellow visual direction; 18 cached poster references and three executive portraits with visible source and license credits. Adds five-round probability scoring, poster-blind mode, optional model help, preserved forecast/outcome receipts, local best, replay, copyable scorecards, and CSV export. Executive dossiers retain their sourced timelines. A searchable 538-film backlot supports sorting, 1×/2.5×/5× definitions, and per-film comparisons of budget/year, base-rate, and budget-cohort estimates. The data room reports the baseline's weak held-out performance. Original version remains playable under `public/classic/`.

Validated with five Python model checks, 1,614 independent JavaScript probability comparisons, score/shuffle/interval checks, and retained original simulation checks. Browser QA completed a five-round run, scoring and replay, blind mode, model help, export activation, search, target changes and detail dialogs, mobile game/dossier layout at 390px, executive sources, and navigation to the saved original. Design research and dated reach evidence are in `DESIGN_NOTES.md`.

Limits: historical 1970–2013 selected financial sample, not live box office or a representative market census; archived budgets are not point-in-time greenlight inputs. Probabilities concern gross multiples, not profit or executive skill. Recognizable curated game films and repeated play do not establish forecasting ability or learning. Most archive titles lack a bundled poster and use a title fallback. Local best-score storage may be unavailable in some browser contexts. No causal effect or successful user study is claimed.

## Restore or inspect a version

Every working milestone receives a Git tag and a ZIP. To inspect without replacing current work, extract the desired ZIP into a separate folder and serve its `public` directory. To restore a milestone into a new Git branch after saving current changes, use `git switch -c restore-v0.1.0 v0.1.0`. Do not use a hard reset. The version selector in the site links the playable original; ZIP files preserve the exact full source of each milestone.
