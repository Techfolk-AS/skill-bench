# Experiment: reference-toc-header

**Date:** 2026-03-31
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
**Status:** testing

## Hypothesis

Reference files with a table of contents at the top produce higher signal adoption than files starting directly with content, because Claude uses partial reads to decide whether to commit to the full file.

## Implementation

ProjectB change: Add a ToC header to all 11 reference files listing sections and key concepts. Keep all content identical below the ToC.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment +1.4% (76.7% vs 75.3%). Neutral.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 1 | Layout | 100% | FAIL | n/a |
| 2 | Dark mode | 100% | **33%** | **-67%** |
| 3 | Form validation | FAIL | 100% | n/a |
| 4 | Dialog | 100% | **33%** | **-67%** |
| 5 | Table sort | **33%** | 100% | **+67%** |
| 6 | Animation | 100% | 100% | 0% |
| 7 | Search filter | **20%** | 100% | **+80%** |
| 8 | Fetch API | 100% | 100% | 0% |

Treatment loaded 3 skills (css, html, javascript) vs control's 2. Treatment read 6 unique references vs control's 5.

## Insights

1. **Treatment loaded more skills and read more references.** The ToC listing section headers (including signal names like "data-slab-id", "zap()") may have made references more discoverable, leading to more reads. B activated javascript skill that A didn't.
2. **More reads didn't consistently improve signal adoption.** Prompts #2 (dark mode) and #4 (dialog) degraded despite more files read. Extra reads may dilute focus on the most relevant reference.
3. **Multi-skill prompts benefited most.** #5 (table sort: +67%) and #7 (search filter: +80%) are cross-domain tasks that benefit from broader reading. The ToC encouraged Claude to explore more references.
4. **Net effect is a wash (+1.4%).** ToC helps complex prompts, hurts simple ones. Not a universal improvement. Value depends on task complexity.

## Learnings

1. **Reference ToCs are neutral overall.** They encourage broader reading (more refs loaded) but don't improve per-prompt accuracy. The broader reading helps multi-domain tasks but can dilute focus on single-domain tasks.
2. **More reference reads != better output.** This is the third experiment (#3, #4, and now #9) confirming this finding. Quality comes from reading the RIGHT reference, not from reading MORE references.
3. **Optional addition for long references.** A ToC doesn't hurt and helps human maintainability. Add to references over 100 lines, skip for short ones.

