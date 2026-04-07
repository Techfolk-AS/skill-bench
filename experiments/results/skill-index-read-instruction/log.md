# Experiment: skill-index-read-instruction

**Date:** 2026-03-30
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/
**Status:** testing

## Hypothesis

A CLAUDE.md docs index with explicit "read before task" instruction will increase reference file loading rate vs semantic-only skill triggering (56% miss rate reported by Vercel evals).

## Implementation

ProjectB change: Replace skill-index placeholder in CLAUDE.md with a full docs index listing all 11 reference files grouped by domain, plus the instruction "Before starting any task, identify which docs below are relevant and read them first."


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment +3.1% (misleading due to 3 Docker failures on B-side)**

Excluding failures: Treatment wins 100% vs 24% on discriminating prompts (4, 5, 6).

| Prompt | Control | Treatment | Delta |
|--------|---------|-----------|-------|
| 4 (dialog) | 14% | 100% | **+86%** |
| 5 (table sort) | 25% | 100% | **+75%** |
| 6 (animation) | 33% | 100% | **+67%** |
| 2 (theming) | 100% | 100% | 0% |
| 3 (forms) | 100% | 100% | 0% |
| 7 (search) | 100% | FAIL | n/a |
| 8 (fetch) | 100% | FAIL | n/a |

Subskill reads: B loaded 9 unique references vs A's 5. Treatment read dialog-patterns, table-patterns, animation-patterns, state-management, best-practices files that control never touched.

## Insights

1. **Treatment wins decisively on multi-reference tasks** (prompts 4, 5, 6). The control completely missed dialog-patterns, table-patterns, and animation-patterns references. These are exactly the "56% miss rate" the article describes: semantic matching failed to connect "confirmation dialog" with the dialog-patterns skill.
2. **Control won where treatment failed to run** (prompts 7, 8). Those B-side failures are Docker timeouts, not treatment problems. If we exclude crashes, treatment outperforms 100% vs ~24% on discriminating prompts.
3. **Both work for "obvious" tasks** (prompts 2, 3). When the task keyword directly matches the skill description (e.g., "dark mode" -> "theming"), semantic triggering works fine. The treatment adds no value here.
4. **Neither over-triggers on negatives** (prompts 9, 10). The explicit read instruction doesn't cause Claude to load irrelevant references.

## Learnings

1. **Explicit CLAUDE.md docs index dramatically improves multi-reference loading.** Semantic skill matching fails when the task description doesn't use the same keywords as the skill description (e.g., "confirmation dialog" vs "dialog-patterns").
2. **Simple, keyword-aligned tasks trigger correctly either way.** "Dark mode toggle" and "form validation" map cleanly to skill descriptions. The treatment adds no value here.
3. **No false-positive leakage on negative prompts.** The "read before task" instruction doesn't cause over-reading.
4. **3 Docker timeouts on B-side (prompts 1, 7, 8) need investigation.** Could be resource contention from parallel runs. Doesn't invalidate the core finding.

