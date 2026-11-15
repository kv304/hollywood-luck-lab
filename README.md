# Hollywood Luck Lab

**[Project overview and public demo](https://kv304.github.io/hollywood-luck-lab/portfolio.html)** · [Open the lab](https://kv304.github.io/hollywood-luck-lab/index.html) · [Methodology](https://kv304.github.io/hollywood-luck-lab/methodology.html) · [One-page work sample](https://kv304.github.io/hollywood-luck-lab/work-sample/Karan_Verma_Hollywood_Luck_Lab_Work_Sample.pdf)

**Karan Verma · USC COMM 502 · Working prototype.** The central product question is how to make film-performance evidence and uncertainty understandable through interaction. This portfolio demonstrates an inspectable product and modeling workflow; the observed predictive gain is modest and uncertain.

An entertainment-focused COMM 502 prototype: five movie forecasts, an outcome reveal, real posters and executive portraits, eight historical case files, a browsable career dataset, and inspectable model comparisons. Runs as a static site with no API key, framework, account, or backend.

## Contribution and AI assistance

I shaped the questions and use cases, connected them to communication coursework, and iterated the experience through design and functionality reviews. I developed the prototype with AI assistance for research, implementation, debugging, and test development. Data sources, methods, and validation commands are available for inspection. No user study has established a learning or engagement benefit.

## Where I’m taking the project next

Hollywood Luck Lab is an initial working prototype, and there is much more I want to build. The current version is a starting point for exploring how entertainment data, machine learning, and communication can work together.

**These plans depend on the data I can collect from publicly accessible internet sources, including downloadable datasets, available APIs, and web scraping where feasible.** Coverage, historical depth, consistency, and access will shape which questions I can investigate meaningfully. I’m starting with the evidence I can obtain, documenting its gaps, and refining the scope as I learn what it can support.

### Current focus

- **Expand the data and improve the models.** Collect richer film metadata and historical context, investigate missing information, and compare additional features against existing baselines. The aim is to improve predictive performance and probability calibration, checking whether any improvement holds on genuinely new data.

- **Make the Data Room more explanatory.** Add ways to inspect features, their relationship to model estimates, and the reliability of predicted probabilities. I want to connect the statistical explanation to a practical question: what does this information actually tell us about a film’s likely performance? Feature associations and model sensitivities will be distinguished from causal explanations.

### Planned explorations

- **Explore film content through NLP.** As suitable scripts become publicly available, investigate representations of themes, narrative structure, dialogue, and other content characteristics. Explore whether content-derived features add useful information to performance models or support more relevant content ranking. Performance prediction and recommendation ranking are separate evaluation questions.

- **Investigate theatrical-to-streaming release windows.** Explore how a film’s characteristics, theatrical trajectory, and release context relate to the timing of its streaming debut. Start with descriptive analysis and forecasting, then assess whether the available evidence supports recommendations about release timing rather than assuming an optimal window can be identified.

- **Forecast weekly streaming Top 10 outcomes.** Investigate whether historical chart trajectories, release schedules, content features, and other public signals can help predict which films and TV shows enter or remain in a platform’s weekly Top 10. Define the platform, market, week, and chart measure explicitly, depending on the records available.

These are directions I want to explore, rather than promised features. I’ll prioritize those supported by sufficiently reliable public data and distinguish exploratory findings from validated results. New capabilities will be documented alongside their evaluation and limitations.

## Public deployment

GitHub Pages publishes only `public/` through `.github/workflows/pages.yml` when `main` changes. The workflow verifies probability logic, retained simulation logic, local links, and portfolio dataset counts before deployment. The source repository also contains the Python pipeline, tests, and documented source snapshots. Coursework assignments are kept in separate repositories.

The portfolio entry point is `portfolio.html`; `index.html` remains the playable lab. All local assets use relative paths so they work under the repository URL prefix. No login or runtime API key is required. Some external artwork and optional fonts require a network connection.

The brief is built with `python3 scripts/build_work_sample.py` using ReportLab (an optional document dependency, separate from model requirements). It writes `output/pdf/` and a deployable copy under `public/work-sample/`. The included screenshot is captured from the working game. Pass `--site` and `--repo` to update its clickable URLs when moving the project.

## Run

From this folder, serve `public` using `python3 -m http.server 8765 --bind 127.0.0.1 --directory public`, then visit `http://127.0.0.1:8765/`. Opening `public/index.html` directly also works because the runtime data is bundled as JavaScript. Google Fonts is optional; local system fonts provide fallbacks. Official reading/trailer links open externally.

## What is playable

- Five-movie curated forecast game, optional model help, outcome reveal, proper probability scoring, local best, replay, clipboard scorecard, and CSV export.
- Poster-visible and poster-blind modes. Blind mode hides the current film's poster, title, and editorial label until the result; it is not randomized experimental assignment.
- A searchable 538-film archive, with three target definitions (1×, 2.5×, 5× gross/budget), sorting, and a detail dialog comparing richer-context, constant base-rate, and smoothed budget-cohort estimates, plus model sensitivities and earlier comparable films.
- Eight browsable executive/producer stories, company filters, portraits, year-by-year narrative reveals, and sources. Includes Paramount, Disney, Sony, Marvel, New Line/Warner, and Shondaland/Netflix. These do not calculate executive skill or infer causal credit.
- A 2,671-person career explorer: search, actor/director and decade filters, gross/multiple charts, missing-value counts, data-derived standout comparisons, five-film highlight-reel shuffling, and a downloadable credited-film CSV. Selected 1916–2017 records, not complete careers.
- Source notes, image attribution, model/audit downloads, sourced trivia, official media links, and an optional COMM 502 design rationale.
- The original sandbox and case-file design at `public/classic/index.html`.

## Real data and model

`scripts/fetch_sources.py` downloads the publisher's FiveThirtyEight CSV, README, and license, recording source URLs and SHA-256 hashes. The unauthenticated GitHub metadata API was rate limited, so the upstream commit is explicitly null; the stored bytes and hash identify this snapshot. The data is archived, not live scraped box office.

`scripts/build_model.py` uses NumPy to clean the data, fit regularized logistic baselines, and emit browser-ready records and an evaluation report. It does not require scikit-learn. Run with a Python environment containing NumPy to rebuild.

Of 1,794 input records, 51 share ambiguous financial signatures and 17 lack usable financial values. All 68 are excluded, including potentially correct members of duplicate groups. This catches the Avengers and Frozen title collisions without inventing corrections. The retained 1,726 films span 1970–2013: 1,188 through 2008 train the model, and 538 from 2009–2013 form the temporal holdout. Features are log nominal production budget and year. Revenue, Bechdel label, awards, posters, title, ratings, and executive identity are excluded from features.

The standard target is reported worldwide gross ≥ 2.5× reported production budget. This is a comparison rule, not profit, break-even, ROI, artistic quality, or a universal definition of a hit. The archive also supports 1× and 5×. The source's `intgross` field is used as reported worldwide total, not added to domestic gross; named-film examples were cross-checked, but the full dataset is not independently financially audited.

Version 3 enriches this unchanged financial sample using the publisher's TMDB 5000 snapshot: 4,802 dated films, 1,564 exact title/year metadata joins, including 496 of the 538 test films. Genre, release timing, language, and strictly earlier credited-film histories add context. Six candidates are compared on 2005–08, using a model fit through 2004 and validation history frozen at 2004. Winners are refit through 2008 and evaluated on 2009–13. Later gross, ratings, popularity, and future career results are excluded. A fixed decreasing projection across thresholds keeps the three target estimates coherent.

At 2.5×, classification accuracy improves from **49.44% to 56.13%**; Brier error falls from **0.2540 to about 0.2472** after the consistency adjustment. This is a modest observed gain. A paired-bootstrap interval for the gain includes no improvement. The model remains poorly calibrated in some bands and misses recognizable hits. Model selection favors richer logistic regression over the tree challengers at this target; complexity alone is not the improvement. Full validation metrics, raw/adjusted results, calibration groups, and source hashes are in the report.

Read `public/data/research-notes.md` for the full protocol, financial-source differences, licensing, explanations, and limitations. TMDB's publisher license is “Other (specified in description)” referring to TMDB terms, **not CC0**; FiveThirtyEight's CC BY license does not cover the added catalog or images. Career charts use the TMDB snapshot's financials; the game retains FiveThirtyEight's. Executive cases use their linked reporting. Do not silently combine those observation dates or gross definitions.

Rebuild with an isolated Python environment using `requirements.txt`. Run `scripts/fetch_research.py` to download/extract the public publisher ZIP and save provenance, then `scripts/build_model.py`, `scripts/build_research.py`, and `scripts/build_people.py`, in that order. The raw CSVs are extracted from the tracked ZIP and ignored by Git to avoid duplicating the large credit source. There is no API key requirement. A Netflix bulk-viewing download failed with incomplete responses and is not used; TV currently appears in a sourced Shondaland case, not a comprehensive television career dataset.

Scoring uses `100 * (1 - (forecast_probability - binary_outcome)^2)` per film. The five-film curated game is separate from full holdout evaluation. Prior knowledge, help, and repeated play can raise game scores. The budget cohort uses Beta(2,2) smoothing; its Wilson interval is for the raw cohort rate, not a per-film uncertainty interval.

## Verify

- `python3 tests/test_model.py`: five checks for chronology, identity collisions, correct labels, reproducible fitting, exported predictions, and evaluation consistency. Requires NumPy.
- `node tests/forecast.test.cjs`: verifies all 1,614 legacy baseline probabilities independently in JavaScript; checks score endpoints, invalid inputs, shuffle, and Wilson intervals.
- `.venv/bin/python tests/test_research.py`: independently refits selected richer models, verifies displayed metrics and explanation sensitivities, tests future-outcome exclusion and validation cutoffs, threshold ordering, earlier comparables, joins, and career aggregates.
- `node tests/simulation.test.cjs`: checks the retained original sandbox's random streams and tie treatment.
- `python3 scripts/check_public_site.py`: checks deployable relative links, the work-sample PDF, and portfolio counts against exported data. Forecast checks also verify calibration-band boundaries and membership for every film/target estimate.

Browser QA covers a five-round run, model help, slider updates, scoring, replay, blind mode, export activation, archive search, changing targets, detail dialogs, executive dossier reveals, source panels, and a 390-pixel responsive layout. See the changelog for limitations.

## Media and attribution

`scripts/fetch_sources.py --media` runs the media fetcher. Small poster references and executive portraits retain individual source pages and hashes; Commons portraits retain author/license metadata. Existing assets are reused, rate-limited requests back off, and missing thumbnails are not invented. The media manifest records each cached image or verified remote reference. `scripts/fetch_catalog_media.py` batches release-year-checked movie image mappings; `--cache-limit N` attempts N additional local copies and stops at a source rate limit. Cached artwork works offline; remaining source images load lazily and need a connection. Failed images display the title. Do not interpret a film page image as a certified original theatrical poster.

Financial data: FiveThirtyEight, CC BY 4.0. Full license: `public/data/LICENSE-data.txt`. Poster artwork retains its respective copyrights. The D23 portrait credits Disney. Commons portraits credit John Mathew Smith / celebrity-photos.com (Lansing, CC BY-SA 2.0) and Angela George (Horn, CC BY-SA 3.0); visible credits link authors, licenses, and source file pages. Image rights are separate from the data license. Portraits are displayed with CSS crops; source files are unaltered. Media provenance: `public/assets/manifest.json`.

No responses or analytics are uploaded. Only the best score is retained in this browser's local storage, when available, with a clear-score control. Calls, dossier choices, and active rounds stay in memory and clear on reload. Clipboard sharing occurs only on the explicit copy button.

## Versions and design evidence

`CHANGELOG.md` records tagged checkpoints, ZIP snapshots, and nondestructive restore instructions. Version 1 remains playable, with Git history and a source ZIP. `DESIGN_NOTES.md` records entertainment references, dated reach evidence, the COMM 502 A/B/C mapping, data limits, and proposed user evaluation. These design references inform hypotheses; their popularity is not proof that this UI improves learning.
