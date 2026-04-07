# Experiment: pure-routing-skill-body

**Date:** 2026-03-31
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://www.mindstudio.ai/blog/claude-code-skills-architecture-skill-md-reference-files
**Status:** testing

## Hypothesis

A SKILL.md body with ONLY numbered steps and reference directives (zero inline domain context) will produce higher reference loading and signal adoption than a mixed body with inline context + references.

## Implementation

ProjectB change: Rewrite all three SKILL.md bodies to pure routing format. Remove inline context lines (e.g., "Layouts use a data-rack attribute system"). Keep only numbered steps pointing to references. All domain knowledge stays exclusively in reference files.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment +12.5% (100% vs 87.5%). But delta is from 1 Docker timeout on control, not treatment effect.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 2 | Dark mode | 100% | 100% | 0% |
| 3 | Form validation | 100% | 100% | 0% |
| 4 | Dialog | **FAIL** | 100% | n/a |
| 5 | Table sort | 100% | 100% | 0% |
| 6 | Animation | 100% | 100% | 0% |
| 8 | Fetch API | 100% | 100% | 0% |

Both sides loaded identical skills (css, html) and references (theming.md, form-patterns.md). Pure routing did not increase reference reads.

## Insights

1. **Both sides loaded identical skills and references.** Pure routing format didn't cause more or fewer reference reads. The "Do NOT proceed on training knowledge alone" disclaimer had no measurable effect.
2. **Removing inline context hints didn't hurt or help.** "Layouts use a data-rack attribute system" in control didn't give Claude enough to skip references, and removing it didn't force more reads.
3. **The delta is entirely from a Docker timeout** on prompt #4 (control side failed), not from treatment design. 7/8 completed prompts scored identically at 100%.
4. **Body format (pure routing vs mixed) is neutral** for reference loading in this test setup. The format of SKILL.md instructions matters less than what the references themselves contain.

## Learnings

1. **Pure routing SKILL.md doesn't improve reference loading.** The theory that inline context lets Claude "wing it" wasn't supported. Claude loads references based on the WHEN conditions matching the task, not based on how much context the SKILL.md body provides.
2. **The routing disclaimer has no effect.** "Read at least one reference below. Do NOT proceed on training knowledge alone" didn't change behavior. Claude either loads a reference because it matches the task, or it doesn't.
3. **Keep the mixed format.** Inline context hints like "Forms use a flux-pod wrapper system" are harmless (don't hurt reference loading) and useful for human readers. No reason to strip them.

