# Experiment: description-with-examples

**Date:** 2026-03-31
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d
**Status:** testing

## Hypothesis

Adding concrete use-case examples to skill descriptions improves activation rates on indirect prompts compared to prose-only descriptions. Examples give Claude pattern-match anchors.

## Implementation

ProjectB change: Append 2-3 concrete example prompts to each skill description field. E.g., CSS description gets "Examples: 'add dark mode', 'make the sidebar responsive', 'add hover animations'". Same domain terms, different format.


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results

**Overall: Treatment -10% (85% vs 95%). Examples hurt more than they help.**

| # | Prompt | Control | Treatment | Delta |
|---|--------|---------|-----------|-------|
| 1 | Dark mode (close to example) | 100% | 100% | 0% |
| 2 | Form validation (close to example) | 100% | **50%** | **-50%** |
| 3 | Fetch API (close to example) | 100% | 100% | 0% |
| 4 | Responsive (indirect) | 100% | 100% | 0% |
| 5 | Confirm delete (indirect) | 100% | 100% | 0% |
| 6 | Search filter (indirect) | 100% | 100% | 0% |
| 7 | Hover feedback (indirect) | **50%** | 100% | **+50%** |
| 8 | Persist state (indirect) | 100% | FAIL | n/a |

Treatment read more CSS refs (4 vs 3) but missed JS signals on prompt #2.

## Insights

1. **Examples act as attractors that bias skill selection.** "Add hover animations" in CSS description made prompt #7 work better (50%->100%) by acting as a pattern-match anchor. But this same bias may have competed with JS skill activation for prompt #2.
2. **Prompt #2 (form validation) degraded from 100% to 50%.** Control loaded JS signals (zap, createVault). Treatment missed them. The extra CSS example "add form validation" in the HTML description may have biased Claude toward HTML-only handling when the task also needed JS.
3. **Examples help exact matches, hurt cross-domain tasks.** When a prompt aligns with one example, it strengthens that skill. But multi-skill tasks get pulled toward the skill with the closest example, starving other relevant skills.
4. **The net effect is negative because most real tasks are cross-domain.** Single-skill prompts already trigger correctly without examples (experiment #2 showed this). The value of examples is on indirect prompts, but those are precisely the ones that need multi-skill coordination.

## Learnings

1. **Don't add examples to skill descriptions.** They create attractor bias that helps some prompts and hurts others, with a net negative (-10%) effect.
2. **Description content should be general, not example-driven.** Domain terms (experiment #6) work because they broaden semantic matching. Examples narrow it to specific patterns.
3. **Cross-domain task quality depends on balanced skill activation.** Anything that biases toward one skill (examples, keyword density) hurts tasks that need multiple skills.

