# Experiment: gotchas-vs-rules-framing

**Date:** 2026-03-31
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d
**Status:** testing

## Hypothesis

Framing skill instructions as "Common failures" (what goes wrong) produces higher signal adoption than framing the same content as conventions/rules (what to do right). Same information, different cognitive frame.

## Implementation

ProjectB change: Add a "Common failures" section to each SKILL.md body that reframes the key conventions as failure modes. Control keeps the current neutral "This project uses custom X conventions" framing.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment -44.4% (55.6% vs 100%). Driven by 5 Docker timeouts on B-side vs 1 on A-side.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 4 | Dialog | 100% | 100% | 0% |
| 6 | Animation | 100% | 100% | 0% |
| 8 | Fetch API | 100% | 100% | 0% |
| 9 | Comments (neg) | 100% | 100% | 0% |
| 10 | Rename (neg) | 100% | 100% | 0% |
| 2 | Dark mode | 100% | FAIL | n/a |
| 3 | Form validation | 100% | FAIL | n/a |
| 5 | Table sort | 100% | FAIL | n/a |
| 7 | Search filter | 100% | FAIL | n/a |

When both completed: identical 100% pass rates. Gotchas framing caused more timeouts.

## Insights

1. **When both sides completed, they scored identically (100%).** The gotchas framing didn't improve or hurt signal adoption. The cognitive frame (failure-mode vs neutral conventions) made no difference to output quality.
2. **Treatment caused 5x more Docker timeouts (5 vs 1).** The verbose "FAILURE: Using X without Y" format may cause Claude to spend more reasoning cycles on what NOT to do, leading to slower execution that hits the 120s timeout.
3. **Embedding verification signals in the SKILL.md body (via gotchas) didn't change adoption rates.** This confirms experiment #7: SKILL.md body content doesn't drive signal adoption. Claude follows reference directives, not body prose.
4. **Negative framing may be actively harmful at scale.** More timeouts = worse user experience. Terse "Uses a data-rack system" is both faster and equally effective as verbose "FAILURE: Using standard CSS grid without data-rack breaks the layout system."

## Learnings

1. **Don't use failure-mode framing in SKILL.md.** It doesn't improve output quality and may slow down execution by adding reasoning overhead.
2. **Keep SKILL.md body context terse.** One-line convention hints are sufficient. Claude doesn't need verbose warnings about what not to do.
3. **The SKILL.md body is for routing, not for instruction.** Experiments #7 and #8 both confirm that body format/framing doesn't change reference loading or signal adoption.

