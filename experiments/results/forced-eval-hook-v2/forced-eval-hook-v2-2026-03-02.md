# A/B Experiment Report — 2026-03-02

**profileA** (control): No changes (baseline)
**profileB** (treatment): ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill and activate via Skill tool before proceeding.

## Prompt 1: "Make me a simple webpage with a header, some content, and a footer"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 28 | 23 | ≠ |
| Duration | 50.7s | 48.1s | ≠ |
| Skills loaded | html, css | html, css | = |
| Subskill refs | css → best-practices.md, layout-patterns.md; html → best-practices.md | css → layout-patterns.md, best-practices.md; html → best-practices.md | ≠ |
| Tools | Bash(2), Read(7), Skill(2), Write(3) | Edit(2), Glob(2), Read(5), Skill(2) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 2: "Make me a simple webpage with a header, some content, and a footer"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 28 | 23 | ≠ |
| Duration | 50.7s | 48.1s | ≠ |
| Skills loaded | html, css | html, css | = |
| Subskill refs | css → best-practices.md, layout-patterns.md; html → best-practices.md | css → layout-patterns.md, best-practices.md; html → best-practices.md | ≠ |
| Tools | Bash(2), Read(7), Skill(2), Write(3) | Edit(2), Glob(2), Read(5), Skill(2) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 3: "Create a blog layout with a sidebar and main content area"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 27 | 25 | ≠ |
| Duration | 79.3s | 97.0s | ≠ |
| Skills loaded | html, css | css, html | ≠ |
| Subskill refs | css → best-practices.md, layout-patterns.md; html → best-practices.md | css → layout-patterns.md; html → best-practices.md | ≠ |
| Tools | Edit(1), Glob(1), Read(5), Skill(2), TodoWrite(3), Write(1) | Glob(1), Read(4), Skill(2), TodoWrite(3), Write(2) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 4: "Create a contact form with name, email, and message fields"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 13 | 43 | ≠ |
| Duration | 18.5s | 146.2s | ≠ |
| Skills loaded | html | css, html, javascript | ≠ |
| Subskill refs | html → best-practices.md, form-patterns.md | css → layout-patterns.md; html → form-patterns.md; javascript → event-handling.md | ≠ |
| Tools | Edit(1), Glob(1), Read(3), Skill(1) | Edit(3), Glob(1), Read(6), Skill(3), TodoWrite(6), Write(2) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 5: "Add a click handler to toggle a mobile navigation menu"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 47 | 45 | ≠ |
| Duration | 148.2s | 128.5s | ≠ |
| Skills loaded | javascript | css, javascript, html | ≠ |
| Subskill refs | css → layout-patterns.md, best-practices.md; javascript → event-handling.md | css → best-practices.md, animation-patterns.md; html → best-practices.md; javascript → event-handling.md | ≠ |
| Tools | Edit(8), Glob(1), Read(7), Skill(1), TodoWrite(5), Write(1) | Edit(4), Glob(2), Read(7), Skill(3), TodoWrite(5), Write(1) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 6: "Build a sortable data table for a list of users"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 62 | 47 | ≠ |
| Duration | 263.9s | 125.3s | ≠ |
| Skills loaded | html, javascript, css | css, javascript, html | ≠ |
| Subskill refs | css → layout-patterns.md, best-practices.md; html → table-patterns.md, best-practices.md; javascript → event-handling.md, state-management.md | css → layout-patterns.md; html → table-patterns.md; javascript → event-handling.md, state-management.md | ≠ |
| Tools | Bash(2), Edit(5), Read(11), Skill(3), TodoWrite(7), Write(3) | Glob(1), Read(7), Skill(3), TodoWrite(7), Write(5) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 7: "Fetch and display a list of products from the API"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 69 | 31 | ≠ |
| Duration | 187.8s | 79.2s | ≠ |
| Skills loaded | javascript, html, css | css, html, javascript | ≠ |
| Subskill refs | css → best-practices.md, layout-patterns.md; html → table-patterns.md; javascript → fetch-patterns.md, state-management.md, best-practices.md | css → layout-patterns.md; html → table-patterns.md; javascript → state-management.md, fetch-patterns.md | ≠ |
| Tools | Agent(1), Bash(2), Edit(4), Glob(1), Read(14), Skill(3), TodoWrite(6), Write(2) | Edit(2), Glob(1), Read(6), Skill(3), TodoWrite(3) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 8: "Fetch and display a list of products from the API"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 69 | 43 | ≠ |
| Duration | 187.8s | 157.7s | ≠ |
| Skills loaded | javascript, html, css | css, html, javascript | ≠ |
| Subskill refs | css → best-practices.md, layout-patterns.md; html → table-patterns.md; javascript → fetch-patterns.md, state-management.md, best-practices.md | css → layout-patterns.md; html → form-patterns.md; javascript → event-handling.md | ≠ |
| Tools | Agent(1), Bash(2), Edit(4), Glob(1), Read(14), Skill(3), TodoWrite(6), Write(2) | Bash(2), Edit(1), Read(6), Skill(3), TodoWrite(6), Write(3) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 9: "Write a Python script to process CSV files"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 3 | 3 | = |
| Duration | 16.5s | 18.7s | ≠ |
| Skills loaded | none | none | = |
| Subskill refs | none | none | = |
| Tools | Write(1) | Write(1) | = |
| Signals | 0 | 0 | = |

## Totals

| Metric | profileA | profileB | Diff |
|--------|----------|----------|------|
| Sessions | 7 | 8 | |
| Prompts | 9 | 9 | |
| Events | 346 | 283 | -63 |
| Skills loaded | html, css, javascript | html, css, javascript | |

> **WARNING: Session/prompt mismatch detected.**
> profileA has 7 sessions but 9 prompts — likely missing `/clear` between prompts or extra session starts.
> profileB has 8 sessions but 9 prompts — likely missing `/clear` between prompts or extra session starts.
> Results may include context bleed from prior prompts. Consider re-running affected prompts in fresh sessions.

### Tool Usage

| Tool | profileA | profileB | Diff |
|------|----------|----------|------|
| Agent | 2 | 0 | -2 |
| Bash | 10 | 2 | -8 |
| Edit | 23 | 14 | -9 |
| Glob | 5 | 10 | +5 |
| Read | 68 | 46 | -22 |
| Skill | 17 | 21 | +4 |
| TodoWrite | 27 | 30 | +3 |
| Write | 16 | 14 | -2 |

### Subskill Reads

| Skill | profileA refs | profileB refs | Match? |
|-------|---------------|---------------|--------|
| css | best-practices.md, layout-patterns.md | layout-patterns.md, best-practices.md, animation-patterns.md | ≠ |
| html | best-practices.md, form-patterns.md, table-patterns.md | best-practices.md, form-patterns.md, table-patterns.md | = |
| javascript | event-handling.md, state-management.md, fetch-patterns.md, best-practices.md | event-handling.md, state-management.md, fetch-patterns.md | ≠ |

### Verification Signals (Output Files)

| Signal | profileA | profileB | Proves |
|--------|----------|----------|--------|
| `data-rack` | Y | Y | CSS layout-patterns |
| `--seam` | Y | Y | CSS layout-patterns |
| `data-zap` | — | — | CSS animation-patterns |
| `--pulse` | — | — | CSS animation-patterns |
| `data-coat` | — | — | CSS theming |
| `--ink-` | — | — | CSS theming |
| `.plate-` | Y | — | CSS theming |
| `data-forge-id` | — | Y | HTML form-patterns |
| `flux-pod` | — | Y | HTML form-patterns |
| `forge-trigger` | — | Y | HTML form-patterns |
| `data-hatch-id` | — | — | HTML dialog-patterns |
| `hatch-trigger` | — | — | HTML dialog-patterns |
| `hatch-body` | — | — | HTML dialog-patterns |
| `data-slab-id` | — | — | HTML table-patterns |
| `data-rankable` | — | — | HTML table-patterns |
| `row-lever` | — | — | HTML table-patterns |
| `slab-hollow` | — | — | HTML table-patterns |
| `zap()` | Y | Y | JS event-handling |
| `on_x_y` | — | Y | JS event-handling |
| `createVault()` | Y | Y | JS state-management |
| `linkVault(` | Y | Y | JS state-management |
| `vault.tap(` | — | — | JS state-management |
| `skyFetch()` | Y | — | JS fetch-patterns |
| `/sky/` | — | — | JS fetch-patterns |
| `_landed` | — | — | JS fetch-patterns |
| `_crashed` | — | — | JS fetch-patterns |

## Summary

| Dimension | Match rate |
|-----------|------------|
| Skills loaded | 3/9 prompts identical |
| Subskill refs | 1/9 prompts identical |
| Tool usage | 1/9 prompts identical |
| Verification signals | 20/26 signals identical |

## Conclusion

Differences detected: skills differed in 6/9 prompts; subskill refs differed in 8/9 prompts; 6/26 verification signals differed. The treatment (profileB) produced different subskill loading or output quality — review per-prompt details above to determine if the change is beneficial.
