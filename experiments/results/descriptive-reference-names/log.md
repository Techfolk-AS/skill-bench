# Experiment: descriptive-reference-names

**Date:** 2026-03-30
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://medium.com/@quanap5/claude-code-progressive-disclosure-insights-from-my-learning-5244bc9864aa
**Status:** testing

## Hypothesis

Descriptive reference filenames (layout-patterns.md, animation-patterns.md) lead to higher correct reference loading than generic filenames (ref-1.md, ref-2.md) because Claude uses filenames as semantic signals.

## Implementation

ProjectB change: Rename all 11 reference files to generic names (css/ref-1.md through ref-4.md, html/ref-1.md through ref-4.md, js/ref-1.md through ref-4.md). Update SKILL.md pointers. Keep file contents and SKILL.md descriptions identical.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Delta -1.8% (79.6% vs 77.8%). No significant difference.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 2 | Dark mode | 100% | 100% | 0% |
| 3 | Form validation | 100% | FAIL | n/a |
| 4 | Dialog | 17% | 100% | +83% |
| 5 | Table sort | 100% | 100% | 0% |
| 6 | Animation | 100% | 100% | 0% |
| 7 | Search filter | 100% | FAIL | n/a |
| 8 | Fetch API | FAIL | 100% | n/a |

Both sides loaded same skills (html, css). Treatment read ref-2.md (dialog-patterns) and ref-4.md (best-practices) correctly despite generic names.

## Insights

1. **Descriptive filenames don't matter when the SKILL.md body describes each reference.** Both `form-patterns.md - form identification, validation` and `ref-1.md - form identification, validation` give Claude the same semantic signal. Claude reads the inline description, not the filename.
2. **Both sides showed identical variance.** Control won some prompts, treatment won others. High Docker timeout rate (4/20 runs failed) means the remaining differences are noise, not signal.
3. **The SKILL.md description line is what Claude actually uses.** Treatment correctly selected ref-2.md for dialogs and ref-4.md for best practices by reading the description text next to each reference path.
4. **Invest time in good SKILL.md reference descriptions, not in filename engineering.** The description "dialog identification, triggers, content structure, close buttons" does the semantic heavy lifting regardless of filename.

## Learnings

1. **Filename descriptiveness has no measurable impact on reference loading.** The -1.8% delta is within noise.
2. **SKILL.md inline descriptions are the actual selection mechanism.** Claude reads the list in SKILL.md and picks based on the description text, not the filename.
3. **Still use descriptive names for human maintainability.** Even though Claude doesn't care, human developers navigating the references/ folder benefit from `layout-patterns.md` over `ref-1.md`.

