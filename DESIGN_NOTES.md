# Hollywood Luck Lab v2: entertainment format, honest evidence

## Direction

An interactive film magazine with a five-call game: movie recognition draws the reader in, a probability makes the judgment concrete, and the outcome opens a small story. Coral, violet, yellow, mint, cream, and photographic posters replace the original subdued editorial palette. This palette is an original direction, not a copy of another site's identity and not a claim that color causes engagement.

## References inspected November 12, 2026

| Reference | Evidence and observed pattern | Application in this prototype |
| --- | --- | --- |
| [Letterboxd](https://letterboxd.com/) and its [welcome page](https://letterboxd.com/welcome/) | Poster-led discovery, compact film metadata, personal logging and lists. The [February 2025 Letterboxd/mk2 press release](https://mk2pro.com/wp-content/uploads/2025/02/press-release-letterboxd-and-mk2-launch-partnership-eng.pdf) reported over 18 million members at that date; this is a dated reach indicator, not a current count. | Posters as recognizable entry points, short cards, personal local score rather than a fabricated global leaderboard. |
| [Letterboxd's Four Favorites editorial account](https://embed.letterboxd.com/crew/story/indiewire-inside-the-art-of-letterboxds-four/) and [Instagram](https://www.instagram.com/letterboxd/) | A repeatable question foregrounds a recognizable person's film taste. The official editorial account describes its red-carpet/junket format and viral reception. Direct Instagram browsing was login/rate limited; current post counts, engagement rates, and colors were not audited. | A repeatable five-film episode; individual movies and executives give abstract questions a human/entertainment context. |
| [The Pudding: Film Dialogue](https://pudding.cool/2017/03/film-dialogue/) | An original visual essay combines a concrete film question, interactive inspection, and an explicit methodology. It is a craft reference; no traffic figures were verified. | Start with a movie-level question, then offer the backlot and methodology for readers who want to inspect the measurement. |
| [Rotten Tomatoes](https://www.rottentomatoes.com/) | Film artwork, short labels, grouped discovery shelves, and routes to trailers. | Poster archive, concise outcome labels, separate official trailer/studio links. The lab's gross-multiple label is never presented as a critic score. |
| [Screen Junkies / Honest Trailers](https://www.youtube.com/@screenjunkies) and [the Television Academy's 2016 nominations list](https://www.televisionacademy.com/files/assets/Downloads/68th-nominations-list-v1.pdf) | Its official channel description centers movie commentary and a recurring named format; the Academy list documents Honest Trailers as a recognized series. Search results surfaced inconsistent/stale subscriber counts, so none are used. | A short setup, a reveal, and a compact post-credits fact. No copied jokes, footage, voice, trademarks, or logos. |

These observations supply design hypotheses. They do not demonstrate that any design pattern caused those services' reach or that this prototype will have similar engagement.

## Main interaction

1. Pick poster-visible or poster-blind mode.
2. Give each film a 0–100% probability of grossing at least 2.5× its reported production budget. Optional model help is labeled and preserved in the scorecard.
3. Lock a forecast, see the recorded estimate beside the outcome, and read one sourced production/award fact or a numerical observation.
4. Finish five films, compare forecast scores with the same model on the same films, copy/download the scorecard, or replay.
5. Optional: open executive dossiers; browse all 538 held-out films; compare the model, constant base rate, and budget cohort; alter the outcome definition to 1× or 5×.

## Data feasibility and limits

The downloaded FiveThirtyEight CSV contains 1,794 records. We retain 1,726 after excluding 51 repeated financial signatures and 17 missing/nonpositive financial records. Identity collisions include The Avengers (1998/2012) and Frozen (2010/2013). All affected rows are excluded conservatively, including rows that might be correct. Raw files, license, SHA-256 checksums, and row-level exclusions are retained.

The regularized logistic baseline uses log nominal production budget and release year. It trains on 1,188 films through 2008 and evaluates on 538 from 2009–2013. The 2.5× target yields holdout Brier error 0.2540057 versus 0.2542628 for the constant training base rate, and 49.44% threshold accuracy. No useful predictive superiority is claimed from this tiny difference. The small model is a starting point for discussing base rates and omitted information.

This is retrospective: archived budgets and grosses are not a point-in-time record of what was available at a greenlight meeting. The sample was assembled for a Bechdel analysis, is incomplete, and can retain other errors. Awards, ratings, title, poster, and executive names are excluded from model features. No executive-level probabilities are calculated because the dataset lacks reliable greenlight attribution. Dossier facts are separately sourced and do not turn a tenure into a causal credit assignment.

The label measures gross relative to reported production budget, not profit, investment return, break-even, artistic quality, or audience satisfaction. Distribution shares, marketing, financing, and ancillary revenue are not observed. The source's `intgross` field is treated as reported worldwide total after named-film cross-checks and is not added to domestic gross.

## Media and content

Eighteen small film-poster references and three executive portraits are stored locally with individual source pages and a hash manifest. Sherry Lansing's photo credits John Mathew Smith / celebrity-photos.com under CC BY-SA 2.0; Alan Horn's credits Angela George under CC BY-SA 3.0. Rich Ross's portrait comes from Disney's D23 biography. Poster artwork and Disney's portrait retain their respective copyrights. They are not included in FiveThirtyEight's data license. The visible credits link each source; source metadata is retained in `public/assets/manifest.json`.

Official external media links are opt-in and open in a new tab. They do not autoplay or keep a reader from completing a round. Trivia about awards and production is shown after the forecast so that it cannot serve as a leaked post-release model input. A static archive includes titles missing poster coverage; those cards show their actual title in a clearly styled fallback instead of a broken image.

## COMM 502 evaluation plan

- **A — Engage:** observe whether readers understand the five-film promise and begin a round; ask what attracted them.
- **B — Support cognition/motivation:** observe confusion in the probability input, optional evidence, progress strip, and blind mode; compare what readers attend to. Do not treat repeat play or a higher score as proof of learning.
- **C — Communicate results:** ask readers to explain the difference between gross, budget, probability, profit, and executive credit after a reveal. Record any causal claim they mistakenly infer.

Use consent for any observational study. The product itself has no analytics or response upload. Connect these design choices to the specific assigned course readings in the final academic report. A causal claim about posters would require a properly designed randomized evaluation; the optional mode alone does not provide one.


## Version 3 — One question, three scales

The journey now connects a personal forecast to executive attribution, credited careers, and model evaluation. The hero strip names that route instead of repeating disconnected slogans. A completed slate links into the decision stories; story reveals lead into career exploration; film details lead to the model evidence. The visual palette is retained.

Eight case files add company browsing, explicit role changes, and year-by-year chapters. “Reveal the next chapter” describes the action; “Reconsider my call” provides a useful next action. Company badges remain visible beside recognizable portraits. This applies temporal context to attribution and avoids using the release date as a proxy for a greenlight.

Career charts let readers switch the same films between nominal reported gross and gross/budget. Data-derived summaries name the largest gross and largest multiple, rather than asserting that someone is underrated or overpaid. The five-film reel samples without replacement from observed credits: the same career can look different through selective evidence. No causal measure of luck or talent is claimed.

Model explanations disclose single-feature sensitivity, earlier comparables, and unmatched metadata. They are optional during the game to manage information load. The data room starts with “56 out of 100 versus 49”, then separately checks whether confidence bands match outcomes. Brier scores, model selection, and a bootstrap interval that includes no gain appear in an expandable technical section. Measured improvement is modest; the design uses this uncertainty as part of the lab’s central question.

A source snapshot and reproducible pipeline support the portfolio story. Final credits, budgets, and metadata were collected retrospectively; no prospective forecasting claim is justified. Poster-blind mode is a design affordance, not a randomized experiment. No user study has yet established persuasion, learning, or engagement gains.
