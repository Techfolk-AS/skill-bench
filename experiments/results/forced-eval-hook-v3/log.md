# Experiment: forced-eval-hook-v3

**Date:** 2026-03-02
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**Source:** https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably
**Status:** complete

## Hypothesis

A UserPromptSubmit hook forcing explicit YES/NO skill evaluation increases skill reference reads vs skill-index-only baseline.

## Implementation

ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill and activate via Skill tool before proceeding.


## Test Prompts

| # | Prompt | A: Skills | B: Skills |
|---|--------|-----------|-----------|
| 1 | Blog layout | html, css | css, html |
| 2 | Contact form | html | css, html, javascript |
| 3 | Click handler | javascript | html, css, javascript |
| 4 | Sortable table | html, css, javascript | TIMEOUT |
| 5 | Fetch products | TIMEOUT | css, javascript, html |
| 6 | Newsletter form | html, css, javascript | css, html, javascript |
| 7 | Python (negative) | none | none |
| 8 | Simple webpage | html | css, html |

## Results

- **Rig validation**: PASS. Prompts run correctly, report generates, prompt alignment handles timeouts.
- **Skill activation**: B over-activates on focused prompts (2/6 loaded all 3 skills when 1 was sufficient)
- **Verification signals**: 26/26 identical. Extra skill reads don't improve output quality.
- **Skill tool calls**: A=11, B=16 (+45%)
- **Speed**: Prompt 2 was 7.4x slower in B (135s vs 18s). Overall B slightly faster (1911s vs 1966s) due to A's prompt 6 being slow.
- **Negative controls**: Both correctly loaded nothing for Python.
- **Consistency with v2**: Same over-activation pattern, same signal parity. Rig produces reproducible results.

## Parallel Rig Rerun (2026-03-02, evening)

Reran same experiment with parallelized `experiment-run.ts` (all 16 containers simultaneously).

| Metric | Sequential (earlier) | Parallel (rerun) |
|--------|---------------------|------------------|
| Wall clock | ~32min | 302s (~5min) |
| Speedup | — | ~6x |
| Timeouts | 2 (prompts 4A, 5B) | 3 (prompts 4B, 6A, 6B) |
| Successful | 14/16 | 13/16 |
| Signals | 26/26 identical | 26/26 identical |

Over-activation pattern reproduced (prompts 2,3,8: B loads all skills when fewer suffice). Negative control (prompt 7) identical. Timeout count similar — bounded by 300s cap, different prompts each run.

## Learnings

1. Test rig produces consistent results across runs — v3 matches v2 patterns
2. Forced eval hook reliably over-activates for focused prompts (confirmed across 3 runs)
3. Verification signals are robust — 26/26 identical despite different skill loading
4. Timeouts are inherent to the 300s cap, not rig bugs (different prompts timeout each run)
5. Parallel rig: 6x speedup (32min → 5min), results consistent with sequential runs
6. Docker image inspect can silently fail after retag — retag by image ID to fix
