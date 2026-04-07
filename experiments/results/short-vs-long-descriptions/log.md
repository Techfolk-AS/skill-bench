# Experiment: short-vs-long-descriptions

**Date:** 2026-03-30
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://www.heyuan110.com/posts/ai/2026-02-28-claude-code-skills-guide/
**Status:** testing

## Hypothesis

Ultra-short descriptions (~30-36 chars) that strip domain-specific terms will reduce trigger accuracy on indirect prompts compared to current descriptions (~55-69 chars) that include domain vocabulary.

## Implementation

ProjectB change: Shorten all three skill descriptions to generic ~30-36 char versions that remove domain terms (layout, animation, theming, forms, dialogs, events, state, fetch).


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Delta +1.8% (misleading due to 3 Docker failures on A-side). Excluding failures: treatment underperforms by ~40% on discriminating prompts.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 1 | CSS animations (direct) | 100% | **33%** | **-67%** |
| 3 | Event listeners (direct) | 100% | 100% | 0% |
| 5 | Confirm delete (indirect) | 100% | 100% | 0% |
| 6 | Search filter (indirect) | 100% | **33%** | **-67%** |
| 7 | Hover feedback (indirect) | 100% | **50%** | **-50%** |
| 4 | Responsive (indirect) | FAIL | 100% | n/a |
| 8 | Persist state (indirect) | FAIL | 100% | n/a |

## Insights

1. **Stripping domain terms from descriptions significantly hurts trigger accuracy.** Prompt #1 ("CSS animations") dropped 100% to 33% because "animation" was removed from the description. "CSS styling and visual conventions" doesn't bridge to "animations."
2. **Prompt #6 ("search box, update results live") dropped 100% to 33%.** Control has "events, state management, and API fetching" which connects to search filtering. Treatment's "JavaScript behavior conventions" is too vague.
3. **Domain terms in descriptions are the primary semantic bridge between user intent and skill activation.** This confirms experiment #2 from the opposite direction: adding keyword soup hurts (exp #2), and removing domain terms also hurts (exp #6). The sweet spot is natural language with domain-specific vocabulary.
4. **Description length per se doesn't matter, content does.** The difference isn't 50 chars vs 70 chars. It's having "animation, theming, layout" vs not having them. A 50-char description with the right terms would work fine.

## Learnings

1. **Include domain-specific terms in skill descriptions.** "layout, animation, theming" for CSS, "forms, dialogs, tables" for HTML, "events, state management, fetch" for JS. These are the semantic anchors.
2. **Descriptions should read as natural language with embedded domain vocabulary.** Not keyword soup (exp #2), not generic prose (exp #6). "CSS styling, layout, animation, and theming conventions" is the right pattern.
3. **Every removed domain term is a potential missed trigger.** The description is the sole input to Claude's intent matching. If a term isn't there, that semantic connection doesn't exist.

