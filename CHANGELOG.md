# Saved versions

## v0.1.0 — Original prototype — November 12, 2026

Four fictional executives, a reproducible probability sandbox, CSV exports, and three independently sourced executive case files. Git tag `v0.1.0` and ZIP in `artifacts/hollywood-luck-lab-v0.1.0.zip`. A playable copy is also kept at `public/classic/index.html`.

## v0.2.0-data — Audited historical data and baseline

Publisher snapshot and SHA-256 provenance; 1,726 retained records from 1,794 input rows; 51 ambiguous financial signatures and 17 missing financial rows excluded. Logistic baseline trained on 1,188 films through 2008 and tested on 538 from 2009–2013. Default 2.5× threshold holdout Brier score: 0.2540; constant baseline: 0.2543. Five checks cover chronology, identity collisions, labels, reproducibility, and evaluation. The original UI is still available in this checkpoint.

## v0.2.0 — Entertainment redesign and real-data game

Coral/violet/mint/yellow visual direction; 18 cached poster references and three executive portraits with visible source and license credits. Adds five-round probability scoring, poster-blind mode, optional model help, preserved forecast/outcome receipts, local best, replay, copyable scorecards, and CSV export. Executive dossiers retain their sourced timelines. A searchable 538-film backlot supports sorting, 1×/2.5×/5× definitions, and per-film comparisons of budget/year, base-rate, and budget-cohort estimates. The data room reports the baseline's weak held-out performance. Original version remains playable under `public/classic/`.

Validated with five Python model checks, 1,614 independent JavaScript probability comparisons, score/shuffle/interval checks, and retained original simulation checks. Browser QA completed a five-round run, scoring and replay, blind mode, model help, export activation, search, target changes and detail dialogs, mobile game/dossier layout at 390px, executive sources, and navigation to the saved original. Design research and dated reach evidence are in `DESIGN_NOTES.md`.

Limits: historical 1970–2013 selected financial sample, not live box office or a representative market census; archived budgets are not point-in-time greenlight inputs. Probabilities concern gross multiples, not profit or executive skill. Recognizable curated game films and repeated play do not establish forecasting ability or learning. Most archive titles lack a bundled poster and use a title fallback. Local best-score storage may be unavailable in some browser contexts. No causal effect or successful user study is claimed.

## v0.3.0 — Career replay, explainable models, and story flow

- Fix scorecard, dialog, preview, and dossier image dimensions; preserve portrait and landscape reference art. Verified artwork mappings for 528/538 archive films, many cached locally; remaining mapped artwork loads lazily from the source. All eight case-file portraits are cached with attribution.
- Connect the journey from five movie forecasts to executive timelines, credited careers, individual films, and model evidence. Replace the random marquee and inactive “File opened” button with descriptive navigation and a reconsider action.
- Expand three cases to eight: Lansing/Grey, Ross, Horn, Pascal, Rothman, Feige, Shaye/Lynne, and Rhimes/Shondaland. Add company/name browsing, company badges, sources, and year chapters. No automated executive performance ranking or inferred greenlight credit.
- Build a 4,802-film historical TMDB catalog and 2,671 searchable actor/director profiles, covering selected 1916–2017 credits. Add decade/role filters, gross/multiple chart switching, missing-value counts, data-derived contrasts, credited-film CSV, and a five-film highlight-reel sampling interaction. Careers are selective and dated, not complete or live.
- Join exact title/year metadata to 1,564 original films (496/538 test films). Compare six richer models using earlier validation years; freeze career-history features at training cutoffs; exclude future outcomes, ratings, and popularity. Retain the same financial targets and final 538-film evaluation set.
- Default target accuracy improves from 49.44% to 56.13%; Brier error improves from 0.2540 to 0.2472 after threshold-consistency adjustment. A paired-bootstrap interval includes no gain, so predictive superiority beyond this historical sample remains unproven. Some confidence bands remain poorly calibrated.
- Add per-film sensitivity explanations, earlier budget/genre comparables, a plain-language comparison of three prediction approaches, an accessible calibration table, downloadable join/model audits, and explicit licensing/source boundaries.

Validation: five original Python model checks, four new research checks with independent model refits and explanation verification, 1,614 JavaScript legacy probability checks plus scoring/shuffling/interval checks, retained original simulation checks, syntax checks, decoded cached media, and desktop/mobile browser QA. Browser checks include all five rounds and thumbnail sizing, model help, Sony chapter reveal and reconsider action, formerly missing Tiny Furniture art, career search/filters, metric switching, highlight-reel sampling, and a 390px layout. Existing saved scores were preserved during QA.

Limits: retrospectively assembled, selected historical records; final credits and release timing may not have been known at greenlight; test-set reuse during development; incomplete finances and careers; gross is not profit. The TV expansion currently consists of a sourced Shondaland/Netflix story, not a complete TV performance dataset. Some remote artwork requires a network connection or can fall back to titles. No causal attribution, prospective forecasting performance, or engagement-study result is claimed.

## Restore or inspect a version

Every working milestone receives a Git tag and a ZIP. To inspect without replacing current work, extract the desired ZIP into a separate folder and serve its `public` directory. To restore a milestone into a new Git branch after saving current changes, use `git switch -c restore-v0.1.0 v0.1.0`. Do not use a hard reset. The version selector in the site links the playable original; ZIP files preserve the exact full source of each milestone.
