# Experiment: paths-auto-activation

**Date:** 2026-03-30
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://code.claude.com/docs/en/skills
**Status:** testing

## Hypothesis

Adding paths: glob patterns to SKILL.md frontmatter will auto-activate skills when Claude reads/edits matching files, producing higher reference loading rates than semantic-only triggering.

## Implementation

ProjectB change: Add paths: frontmatter to all three skills mapping file extensions to skill activation (css: *.css, html: *.html, javascript: *.js).


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment -7.4% (81.5% vs 88.9%). paths: auto-activation hurt performance.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 2 | Dark mode | 100% | 100% | 0% |
| 4 | Dialog | 100% | **0%** | **-100%** |
| 5 | Table sort | 100% | 100% | 0% |
| 6 | Animation | 100% | **33%** | **-67%** |
| 7 | Search filter | 100% | 100% | 0% |
| 8 | Fetch API | 100% | 100% | 0% |
| 3 | Form validation | FAIL | 100% | n/a |

Treatment loaded 3 skills (css, html, javascript) vs control's 2 (css, html), but read less relevant references.

## Insights

1. **paths: auto-activation loaded more skills but read worse references.** Treatment activated javascript skill via *.js glob but read event-handling.md instead of task-relevant references. More activation != better targeting.
2. **Prompt #4 (dialog) went from 100% to 0%.** paths: triggered HTML skill when touching index.html, but Claude read best-practices.md instead of dialog-patterns.md. Broad file-based activation doesn't steer reference selection.
3. **Prompt #6 (animation) dropped from 100% to 33%.** CSS skill activated correctly via *.css glob, but Claude read theming.md instead of animation-patterns.md. Auto-activation gets the SKILL.md body loaded, but the SKILL.md body already lists all references equally.
4. **paths: triggers skill loading, not reference selection.** This is the fundamental limitation. It ensures the SKILL.md is in context, but SKILL.md lists all references neutrally. Without additional steering toward the *right* reference, broad activation can actually dilute focus.

## Learnings

1. **paths: is not a replacement for good descriptions.** It solves a different problem (ensuring skill loads when touching certain files) but doesn't help Claude pick the right reference.
2. **Use paths: for limiting, not for triggering.** The intended use is to prevent a skill from loading when irrelevant files are being edited. For positive triggering, semantic matching or CLAUDE.md indexes work better.
3. **Experiment #1's CLAUDE.md index remains the best strategy** because it both lists the references AND tells Claude which to read for which task domain.

