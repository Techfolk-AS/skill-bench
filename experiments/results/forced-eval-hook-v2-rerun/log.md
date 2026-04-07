# Experiment: forced-eval-hook-v2-rerun

**Date:** 2026-03-02
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably
**Status:** testing

## Hypothesis

A UserPromptSubmit hook that forces explicit YES/NO evaluation of each skill before implementation will increase skill reference reads compared to skill-index-only baseline.

## Implementation

ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill and activate via Skill tool before proceeding.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results



## Learnings

