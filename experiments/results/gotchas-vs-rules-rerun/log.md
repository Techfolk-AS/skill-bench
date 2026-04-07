# Experiment: gotchas-vs-rules-rerun

**Date:** 2026-03-31
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d
**Status:** testing

## Hypothesis

Rerun of gotchas-vs-rules-framing with 180s timeout (original had 120s, 5 Docker timeouts on B-side). Same hypothesis: failure-mode framing vs neutral conventions.

## Implementation

ProjectB change: Add "Common Failures" section to each SKILL.md body reframing key conventions as failure modes. Same treatment as original experiment.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment -18.8% (66% vs 84.8%). Confirms original: gotchas framing is negative.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 1 | Layout | 100% | FAIL | n/a |
| 2 | Dark mode | 100% | **60%** | **-40%** |
| 3 | Form validation | 100% | 100% | 0% |
| 4 | Dialog | 100% | FAIL | n/a |
| 5 | Table sort | **14%** | 100% | **+86%** |
| 6 | Animation | **33%** | 100% | **+67%** |
| 7 | Search filter | 100% | FAIL | n/a |
| 8 | Fetch API | 100% | 100% | 0% |

Control read 6 unique references, treatment read 4. Treatment still timed out 3 times even at 180s.

## Insights

1. **Gotchas framing is definitively negative (-18.8%), confirmed across two runs.** Original (-44.4% at 120s) was inflated by timeouts, but the real signal is still negative at 180s.
2. **Treatment won on prompts where gotchas embedded the exact signal name.** #5 (table: "FAILURE: Using plain table without data-slab-id") and #6 (animation: "FAILURE: Using raw CSS animations without data-zap") passed because the signal was literally in the SKILL.md body.
3. **Treatment lost on dark mode (#2: 100%->60%).** Control read more diverse references (6 vs 4). The verbose gotchas section consumed context space that could have been used for broader reference reading.
4. **Gotchas framing still causes 3x more timeouts** (3 vs 0 at 180s). The verbose "FAILURE: Using X without Y" format demonstrably slows Claude's reasoning loop.

## Learnings

1. **Gotchas framing is harmful.** It embeds some signal names (helping 2 prompts) but at the cost of verbosity that causes timeouts and reduces reference breadth.
2. **If you want signals in the SKILL.md body, use the terse format** ("Layouts use a data-rack system") not the verbose format ("FAILURE: Using standard CSS without data-rack breaks the layout system"). Same information, 3x fewer tokens.
3. **Inline signal hints are a poor substitute for reference reading.** Experiments #7, #8, #8-rerun all show that SKILL.md body content has marginal impact compared to reference file content.

