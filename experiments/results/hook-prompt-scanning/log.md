# Experiment: hook-prompt-scanning

**Date:** 2026-03-30
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://paddo.dev/blog/claude-skills-hooks-solution/
**Status:** testing

## Hypothesis

A UserPromptSubmit hook that scans the prompt for domain keywords and injects "read these references" context will increase reference loading rate vs semantic-only skill triggering.

## Implementation

ProjectB change: Add a UserPromptSubmit hook (prompt-scanner.ts) that pattern-matches the prompt against keyword sets per domain and outputs additionalContext with specific reference file paths to read.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Delta +0.0% (88.9% both sides). No measurable improvement from hook-based prompt scanning.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 2 | Dark mode | 100% | 100% | 0% |
| 3 | Form validation | 100% | 80% | **-20%** |
| 4 | Confirmation dialog | 100% | **20%** | **-80%** |
| 5 | Table sorting | 100% | 100% | 0% |
| 6 | Fade animation | 100% | 100% | 0% |
| 7 | Search filter | FAIL | 100% | n/a |
| 8 | Fetch API | 100% | 100% | 0% |
| 9 | Comments (neg) | 100% | 100% | 0% |
| 10 | Rename (neg) | 100% | 100% | 0% |

Subskill reads: B loaded 5 unique references (gained state-management, event-handling, table-patterns, best-practices), A loaded 3 (theming, form-patterns, dialog-patterns). But more reads didn't translate to better signal pass rates.

## Insights

1. **Hook-based prompt scanning did NOT improve trigger rates overall.** Despite injecting specific reference file paths via additionalContext, the treatment matched the control at 88.9%. The hook added reads but didn't improve signal adoption in the generated code.
2. **The hook actually hurt on prompt #4 (dialog).** Control scored 100% on dialog signals, treatment scored 20%. The injected context may have caused Claude to read more references broadly rather than deeply focusing on the most relevant one. More context is not always better context.
3. **additionalContext injection is "suggestion, not guarantee."** The hook tells Claude "read these files" but Claude still decides what to do with the content. Compare this to experiment #1's CLAUDE.md index which had similar instructions but placed in CLAUDE.md (always-visible, higher authority). The hook's additionalContext may carry less weight in Claude's decision-making.
4. **Treatment added ~10s average execution time.** Extra hook execution + extra reference reads cost time without improving outcomes. This is a pure cost with no benefit.

## Learnings

1. **UserPromptSubmit hooks for skill injection are not worth the complexity.** The hook correctly identified relevant references but Claude didn't consistently use them to improve output quality.
2. **CLAUDE.md index (experiment #1) outperforms hook injection for the same goal.** Both tell Claude "read these files," but CLAUDE.md placement carries more weight than additionalContext injection.
3. **More reference reads != better output.** Treatment read more files but produced worse dialog signals. Focused, selective reading beats broad scanning.

