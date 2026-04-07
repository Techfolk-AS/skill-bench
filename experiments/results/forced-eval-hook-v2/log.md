# Experiment: forced-eval-hook-v2

**Date:** 2026-03-02
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably
**Status:** complete

## Hypothesis

A UserPromptSubmit hook that forces explicit YES/NO evaluation of each skill before implementation will increase skill reference reads compared to skill-index-only baseline.

## Implementation

ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill and activate via Skill tool before proceeding.


## Test Prompts

| # | Prompt | A: Skills | B: Skills |
|---|--------|-----------|-----------|
| 1 | Broad webpage | html, css | html, css |
| 2 | Blog layout | html, css | css, html |
| 3 | Contact form | html | css, html, javascript |
| 4 | Click handler | javascript | css, javascript, html |
| 5 | Sortable table | html, javascript, css | css, javascript, html |
| 6 | Fetch products (A timeout) | javascript, html, css | css, html, javascript |
| 7 | Python (negative) | none | none |
| 8 | Broad webpage (negative) | html, css | html, css |

## Results

- **Skill activation**: B loaded more skills for single-domain prompts (all 3 vs 1). Over-activation.
- **Verification signals**: A=7/26, B=9/26. B produced 3 unique HTML form signals, 1 unique JS event signal.
- **Skill tool calls**: A=17, B=21 (+4)
- **Speed**: Mixed. Prompt 3 (contact form) B was 8x slower (146s vs 18s) due to loading all skills.
- **Negative controls**: Both correctly loaded nothing for Python. Both loaded html+css for broad prompt.
- **Verdict**: Hook increases activation rate and output signal coverage but sacrifices precision. Every web prompt becomes "load all skills" instead of targeted loading.

## Learnings

1. Forced YES/NO evaluation biases toward YES for related-domain skills
2. More skill reads don't always mean better output — targeted reads may be more efficient
3. The hook adds significant latency on focused prompts where only 1 skill is needed
4. The article's "84% activation" claim is plausible but measures quantity, not quality of activation
