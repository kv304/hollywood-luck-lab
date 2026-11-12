# Hollywood Luck Lab

A self-contained COMM 502 prototype about interpreting track records. No framework, database, API key, or model download is required.

## Try it

Open `public/index.html` in a browser, or serve the public folder with any static web server. For example, from this directory: `python3 -m http.server 8765 --bind 127.0.0.1 --directory public`.

The path through the prototype is choose an executive, record confidence, reveal the assigned probabilities, and explore other histories. All computation runs in the browser. No responses are uploaded or retained after reload. The data-export button downloads a CSV containing the opening round, current scenario, and 1,000 histories if calculated.

## Model

Four fictional executives each generate independent Bernoulli film outcomes. In the opening round their probabilities are all 0.5. In exploration Alex can receive a 0–0.30 probability advantage while all other probabilities remain 0.5. An integer seed reproduces each history. Changing the number of films preserves its prefix of random draws. Changing the advantage reuses those draws to isolate the parameter change. “Replay” changes the seed.

The batch comparison counts sole leaders and ties separately. It does not break ties by array order. Batch percentages are Monte Carlo estimates under the specified model, not estimates of real executive ability or evidence about participant behavior.

## Verify

Run `node tests/simulation.test.cjs`. Tests cover reproducibility, nested film histories, the intervention on Alex only, input validation, honest tie handling, and a large-sample sanity check.

## COMM 502 design rationale

| Professor’s criterion | Design decision | Intended mechanism to evaluate |
| --- | --- | --- |
| Attract engagement | A short hiring brief and a concrete first decision | Personal relevance and an achievable task |
| Support interaction | Four initial options; advanced controls appear after the reveal | Selective attention and staged information |
| Support understanding | Common 0–100% scales, labels, and distinct marks for outcomes and probabilities | Comparable visual evidence and explicit uncertainty about inference |
| Encourage reflection | Confidence recorded before the reveal; the original record remains visible | Inspecting the basis of a judgment without labeling the participant biased |
| Avoid an oversimplified lesson | Add a genuine skill difference and increase observations | Show when track records can reveal a real difference |

These are design hypotheses. No usability or learning study has been conducted. The prototype should be evaluated against the assigned course sources before making claims about psychological effects.

## Real-world case files

Three curated historical cases add a forecast-before-reveal interaction: Lansing → Grey at Paramount, Ross at Disney, and Horn with the Disney leadership team. Each separates information available at the stated date from later outcomes and links the underlying reporting or company documents. Visitors retain their own Likely/Unlikely/Need more evidence judgment on each case during the current page session. The cases deliberately include delayed slate attribution, an unmade project, and sustained success as a counterweight to an all-luck explanation.

These are selected illustrations, not a representative sample, a causal estimate, or a validated forecasting test. Do not infer hiring quality from the answers. Lansing’s announcement is described as a planned departure; Ross’s is described as stepping down. Neither is relabeled a firing. McG’s specific halted Captain Nemo production is distinguished from other adaptations; its unrealized box office is unknown, not zero. Grosses are rounded US dollars and are not studio receipts or profit. Company accounts of successful leadership are attributed to the company, not treated as independent causal evidence.

Case research checked November 12, 2026. Core sources: Box Office Mojo’s November 1, 2004 Lansing announcement and 2005 worldwide grosses; UPI’s August 12, 2004 War of the Worlds report; The Guardian’s January 7, 2005 Grey appointment; TheWrap’s April 20, 2012 Ross departure; Disney’s February 17, 2011 investor transcript and May 8, 2012 earnings; The Numbers’ Avengers release/gross record; ComingSoon’s November 17, 2009 Nemo report; ABC’s May 31, 2012 Horn appointment; Disney’s May 1, 2019 co-chair announcement. Exact links are in `public/cases.js` and the visible source accordions. This independently researched extension does not reproduce or claim to verify the book’s exact wording.

## Possible next steps

Observe a few readers using the challenge, record confusion and navigation issues with their consent, revise the wording, and add a small learning reflection. The final progress report can explain the shift from a general learning blog to this interactive article. Add class citations to the final academic report.
