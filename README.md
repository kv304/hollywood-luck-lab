# Hollywood Luck Lab

An entertainment-focused COMM 502 prototype: five movie forecasts, an outcome reveal, real posters and executive portraits, historical case files, and an inspectable movie-data baseline. Runs as a static site with no API key, framework, account, or backend.

## Run

From this folder, serve `public` using `python3 -m http.server 8765 --bind 127.0.0.1 --directory public`, then visit `http://127.0.0.1:8765/`. Opening `public/index.html` directly also works because the runtime data is bundled as JavaScript. Google Fonts is optional; local system fonts provide fallbacks. Official reading/trailer links open externally.

## What is playable

- Five-movie curated forecast game, optional model help, outcome reveal, proper probability scoring, local best, replay, clipboard scorecard, and CSV export.
- Poster-visible and poster-blind modes. Blind mode hides the current film's poster, title, and editorial label until the result; it is not randomized experimental assignment.
- A searchable 538-film archive, with three target definitions (1×, 2.5×, 5× gross/budget), sorting, and a detail dialog comparing logistic, constant base-rate, and smoothed budget-cohort estimates.
- Three executive dossiers with portraits, film posters, forecast-before-reveal timelines, and sources. These do not calculate executive skill or infer causal credit.
- Source notes, image attribution, model/audit downloads, sourced trivia, official media links, and an optional COMM 502 design rationale.
- The original sandbox and case-file design at `public/classic/index.html`.

## Real data and model

`scripts/fetch_sources.py` downloads the publisher's FiveThirtyEight CSV, README, and license, recording source URLs and SHA-256 hashes. The unauthenticated GitHub metadata API was rate limited, so the upstream commit is explicitly null; the stored bytes and hash identify this snapshot. The data is archived, not live scraped box office.

`scripts/build_model.py` uses NumPy to clean the data, fit regularized logistic baselines, and emit browser-ready records and an evaluation report. It does not require scikit-learn. Run with a Python environment containing NumPy to rebuild.

Of 1,794 input records, 51 share ambiguous financial signatures and 17 lack usable financial values. All 68 are excluded, including potentially correct members of duplicate groups. This catches the Avengers and Frozen title collisions without inventing corrections. The retained 1,726 films span 1970–2013: 1,188 through 2008 train the model, and 538 from 2009–2013 form the temporal holdout. Features are log nominal production budget and year. Revenue, Bechdel label, awards, posters, title, ratings, and executive identity are excluded from features.

The standard target is reported worldwide gross ≥ 2.5× reported production budget. This is a comparison rule, not profit, break-even, ROI, artistic quality, or a universal definition of a hit. The archive also supports 1× and 5×. The source's `intgross` field is used as reported worldwide total, not added to domestic gross; named-film examples were cross-checked, but the full dataset is not independently financially audited.

At 2.5×, holdout Brier error is **0.2540** for the budget/year model and **0.2543** for the constant training base rate; classification accuracy at 50% is **49.44%**. The UI discloses this near tie. No predictive superiority or executive ability claim is made. This is a retrospective analysis using archived, post-release financial data and selected sample coverage, not a point-in-time reconstruction of greenlight information.

Scoring uses `100 * (1 - (forecast_probability - binary_outcome)^2)` per film. The five-film curated game is separate from full holdout evaluation. Prior knowledge, help, and repeated play can raise game scores. The budget cohort uses Beta(2,2) smoothing; its Wilson interval is for the raw cohort rate, not a per-film uncertainty interval.

## Verify

- `python3 tests/test_model.py`: five checks for chronology, identity collisions, correct labels, reproducible fitting, exported predictions, and evaluation consistency. Requires NumPy.
- `node tests/forecast.test.cjs`: verifies all 1,614 exported model probabilities independently in JavaScript; checks score endpoints, invalid inputs, shuffle, and Wilson intervals.
- `node tests/simulation.test.cjs`: checks the retained original sandbox's random streams and tie treatment.

Browser QA covers a five-round run, model help, slider updates, scoring, replay, blind mode, export activation, archive search, changing targets, detail dialogs, executive dossier reveals, source panels, and a 390-pixel responsive layout. See the changelog for limitations.

## Media and attribution

`scripts/fetch_sources.py --media` runs the media fetcher. Small poster references and executive portraits retain individual source pages and hashes; Commons portraits retain author/license metadata. Existing assets are reused, rate-limited requests back off, and missing thumbnails are not invented. The bundle has 18 poster references and three executive portraits.

Financial data: FiveThirtyEight, CC BY 4.0. Full license: `public/data/LICENSE-data.txt`. Poster artwork retains its respective copyrights. The D23 portrait credits Disney. Commons portraits credit John Mathew Smith / celebrity-photos.com (Lansing, CC BY-SA 2.0) and Angela George (Horn, CC BY-SA 3.0); visible credits link authors, licenses, and source file pages. Image rights are separate from the data license. Portraits are displayed with CSS crops; source files are unaltered. Media provenance: `public/assets/manifest.json`.

No responses or analytics are uploaded. Only the best score is retained in this browser's local storage, when available, with a clear-score control. Calls, dossier choices, and active rounds stay in memory and clear on reload. Clipboard sharing occurs only on the explicit copy button.

## Versions and design evidence

`CHANGELOG.md` records tagged checkpoints, ZIP snapshots, and nondestructive restore instructions. Version 1 remains playable, with Git history and a source ZIP. `DESIGN_NOTES.md` records entertainment references, dated reach evidence, the COMM 502 A/B/C mapping, data limits, and proposed user evaluation. These design references inform hypotheses; their popularity is not proof that this UI improves learning.
