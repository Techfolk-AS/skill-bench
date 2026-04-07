# Experiment: forced-eval-hook-v4

**Date:** 2026-03-18
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably
**Status:** testing

## Hypothesis

A forced eval hook increases skill activation rate but over-activates on focused prompts, with no measurable improvement in output quality (verification signals).

## Implementation

ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill YES/NO and activate via Skill tool before proceeding.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results



## Learnings

