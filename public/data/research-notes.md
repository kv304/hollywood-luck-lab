# Hollywood Luck Lab research snapshot — November 12, 2026

## What the two film datasets mean

The forecasting game keeps its original FiveThirtyEight financial sample and conservative exclusions: 1,794 input records; 51 ambiguous repeated financial signatures and 17 unusable financial rows removed; 1,726 retained. Training: 1,188 films through 2008. Test: 538 films from 2009–2013. The source's `intgross` is used as the reported worldwide total, without adding domestic gross. These are reported historical numbers, not a comprehensive financial audit or original-release-only totals.

The expanded catalog is Kaggle's TMDB 5000 snapshot: 4,803 input films, 4,802 with a release date. It provides movie IDs, cast billing order, directors, genres, production companies, dates, reported budgets, and revenue. Source: https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata. Publisher metadata and downloaded ZIP hashes are preserved under `data/raw/research/`. One undated record is omitted from the dated catalog.

The publisher's license label is **Other (specified in description)**, referring to TMDB terms. It is **not CC0** and is separate from FiveThirtyEight's CC BY 4.0 data license. This product uses the TMDB API but is not endorsed or certified by TMDB. Here the data arrives through a historical API-derived publisher snapshot, not live API calls. TMDB attribution information: https://developer.themoviedb.org/docs/faq.

Unique normalized title plus exact release year joins metadata to 1,564 of the original films, including 496/538 test films. No fuzzy title match silently assigns cast to a different remake. The join audit records financial differences between the sources; financial targets in the game are not replaced. The career explorer uses the TMDB snapshot's own reported financial columns, so its totals can differ from the game and later case-file sources. They should not be merged as if all were one observation date.

## What the probabilities use

Budget, release year, genre indicators, English-language indicator, cyclical release-month terms, metadata availability, and smoothed earlier-film performance/coverage for directors, the first three billed cast members, and production companies. Each history aggregates distinct credited films and shrinks toward the earlier catalog rate with ten pseudo-observations. A person's whole release year is excluded. Historical features freeze at the relevant training cutoff.

The fitting split is through 2004; model selection uses 2005–2008, with histories frozen through 2004 for validation. Six predefined candidates: logistic regression C=0.1 and C=1; 250-tree random forests with minimum leaves 15 and 30; depth-2 and depth-3 histogram gradient boosting. The lowest validation Brier error selects each target's candidate. Refit through 2008 and evaluate on 2009–2013. All candidates and evaluation metrics remain in `model-report.json`.

Separate target estimates receive an equal-weight decreasing isotonic projection across 1×, 2.5×, and 5×. This uses predictions only and prevents a harder gross target from becoming more likely than an easier one. Both raw and adjusted predictions are retained. Displayed evaluation uses the adjusted values.

The per-film explanation replaces one feature with its median training value and recomputes the unadjusted estimate. This is model sensitivity, not a causal effect, additive attribution, feature importance for the entire dataset, or an uncertainty interval. Adjusted films are labeled. Comparable films come from the original training sample and minimize log-budget distance plus genre Jaccard distance. Their outcomes do not select the comparison films.

No future revenue, ratings, popularity, reviews, awards, or executive identity enters the model. Metadata and budget fields nevertheless come from snapshots assembled after release. Final credits and release timing might not have been known at greenlight. This is a retrospective research demonstration, not a point-in-time commercial forecasting system. The older version had already examined these test films; this is not a pristine external benchmark.

At the default 2.5× target, the richer model gets about 56% of yes/no decisions correct versus 49% for the original; its forecast-score improvement is modest. A 2,000-resample paired bootstrap interval includes no improvement. Film-level resampling assumes independent observations, an imperfect assumption for franchises and shared teams. New external films are needed before making a strong generalization claim.

## What career charts mean

Profiles cover directors and the first eight billed cast members in the selected 1916–2017 catalog. They are **not complete careers**, current box office, personal earnings, or estimates of individual talent. Profiles require three films with positive budget and gross or inclusion in a small recognizable-name list. Missing financial values remain missing and are excluded from financial aggregates. Count each film once per person, retaining multiple credited roles. Summing profiles double-counts films shared by co-stars.

Reported gross is nominal ticket sales; gross/budget is not profit or ROI. Marketing, exhibitor shares, financing, streaming receipts, inflation, market size, release scope, and contribution of teammates are not controlled. The highlight-reel interaction draws five distinct observed films without replacement. It demonstrates selective evidence and small samples, not parallel-universe results or the causal share of luck.

Television currently appears in the independently researched Shondaland/Netflix case. Its 82-million-household figure is Netflix's historical first-28-days measure, not modern views, individual viewers, revenue, or an independently audited total. A bulk Netflix Top 10 download was attempted but returned incomplete responses; it is not used. No comprehensive TV-person performance dataset is claimed.

## Images and sources

Movie reference images are matched to Wikipedia pages that belong to the exact release-year film category, or have an exact film year in their source description. Both portrait and landscape film artwork are retained. This reduces book/remake/disambiguation collisions, but does not certify every image as an original theatrical poster. Featured artwork and many archive images are cached locally; remaining verified image URLs load lazily from the source and require a network connection. Missing or failed images display a title fallback. Portraits come from documented Wikipedia/Commons files or Disney's D23 biography. Source files are unaltered; CSS crops their display. Credits and hashes where cached are in `assets/manifest.json`. Images retain their own rights and are not covered by either data license.

Case-file reporting is linked beside each story. Company announcements establish what the company said and when; they are not independent causal evaluation. Planned departure, ouster, resignation, promotion, partnership, and producer credit are distinct events. A cancelled production has no observed released-film return.
