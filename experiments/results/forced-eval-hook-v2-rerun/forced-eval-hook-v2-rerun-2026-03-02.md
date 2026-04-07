# A/B Experiment Report — 2026-03-02

**profileA** (control): No changes (baseline)
**profileB** (treatment): ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill and activate via Skill tool before proceeding.

## Prompt 1: "Create a blog layout with a sidebar and main content area"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 31 | 27 | ≠ |
| Duration | 62.2s | 59.9s | ≠ |
| Skills loaded | html, css | css, html | ≠ |
| Subskill refs | css → layout-patterns.md, best-practices.md; html → best-practices.md | css → layout-patterns.md, best-practices.md; html → best-practices.md | = |
| Tools | Bash(2), Read(6), Skill(2), TodoWrite(3), Write(2) | Edit(1), Glob(1), Read(5), Skill(2), TodoWrite(3), Write(1) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 2: "Create a contact form with name, email, and message fields"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 50 | 43 | ≠ |
| Duration | 164.2s | 113.5s | ≠ |
| Skills loaded | html, css, javascript | css, html, javascript | ≠ |
| Subskill refs | css → layout-patterns.md; html → form-patterns.md; javascript → event-handling.md, state-management.md, fetch-patterns.md | css → layout-patterns.md; html → form-patterns.md; javascript → event-handling.md | ≠ |
| Tools | Bash(2), Edit(1), Read(9), Skill(3), TodoWrite(5), Write(5) | Bash(2), Edit(3), Read(6), Skill(3), TodoWrite(5), Write(2) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 3: "Add a click handler to toggle a mobile navigation menu"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 27 | 47 | ≠ |
| Duration | 56.1s | 107.9s | ≠ |
| Skills loaded | javascript | css, html, javascript | ≠ |
| Subskill refs | javascript → event-handling.md | css → best-practices.md, layout-patterns.md; html → best-practices.md; javascript → event-handling.md | ≠ |
| Tools | Edit(5), Glob(2), Read(4), Skill(1), Write(1) | Edit(4), Glob(2), Read(7), Skill(3), TodoWrite(6), Write(1) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 4: "Build a sortable data table for a list of users"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 49 | 59 | ≠ |
| Duration | 238.0s | 228.0s | ≠ |
| Skills loaded | html, javascript, css | css, html, javascript | ≠ |
| Subskill refs | css → layout-patterns.md; html → table-patterns.md; javascript → event-handling.md, state-management.md, fetch-patterns.md | css → best-practices.md, layout-patterns.md; html → table-patterns.md, best-practices.md; javascript → state-management.md, event-handling.md, best-practices.md | ≠ |
| Tools | Glob(1), Read(9), Skill(3), TodoWrite(5), Write(6) | Edit(2), Glob(1), Read(12), Skill(3), TodoWrite(7), Write(4) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 5: "Fetch and display a list of products from the API"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 39 | 39 | = |
| Duration | 58.1s | 77.6s | ≠ |
| Skills loaded | none | html, css, javascript | ≠ |
| Subskill refs | none | css → layout-patterns.md; html → table-patterns.md; javascript → fetch-patterns.md, state-management.md | ≠ |
| Tools | Agent(1), Bash(3), Edit(3), Read(7), TodoWrite(4) | Bash(2), Edit(4), Read(7), Skill(3), TodoWrite(3) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 6: "Build a newsletter signup form with a two-column layout"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 0 | 41 | ≠ |
| Duration | 0.0s | 147.0s | ≠ |
| Skills loaded | none | css, html, javascript | ≠ |
| Subskill refs | none | css → layout-patterns.md; html → form-patterns.md; javascript → event-handling.md | ≠ |
| Tools | none | Edit(1), Glob(1), Read(6), Skill(3), TodoWrite(6), Write(3) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 7: "Write a Python script to process CSV files"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 4 | 3 | ≠ |
| Duration | 15.0s | 22.2s | ≠ |
| Skills loaded | none | none | = |
| Subskill refs | none | none | = |
| Tools | Read(1), Write(1) | Write(1) | ≠ |
| Signals | 0 | 0 | = |

## Prompt 8: "Make me a simple webpage with a header, some content, and a footer"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 17 | 13 | ≠ |
| Duration | 68.5s | 24.5s | ≠ |
| Skills loaded | html | css, html | ≠ |
| Subskill refs | html → best-practices.md | css → layout-patterns.md; html → best-practices.md | ≠ |
| Tools | Bash(2), Edit(1), Read(4), Skill(1) | Read(2), Skill(2), Write(2) | ≠ |
| Signals | 0 | 2 | ≠ |

## Totals

| Metric | profileA | profileB | Diff |
|--------|----------|----------|------|
| Sessions | 7 | 8 | |
| Prompts | 7 | 8 | |
| Events | 217 | 272 | +55 |
| Skills loaded | html, css, javascript | css, html, javascript | |

### Tool Usage

| Tool | profileA | profileB | Diff |
|------|----------|----------|------|
| Agent | 1 | 0 | -1 |
| Bash | 9 | 4 | -5 |
| Edit | 10 | 15 | +5 |
| Glob | 3 | 5 | +2 |
| Read | 40 | 45 | +5 |
| Skill | 10 | 19 | +9 |
| TodoWrite | 17 | 30 | +13 |
| Write | 15 | 14 | -1 |

### Subskill Reads

| Skill | profileA refs | profileB refs | Match? |
|-------|---------------|---------------|--------|
| css | layout-patterns.md, best-practices.md | layout-patterns.md, best-practices.md | = |
| html | best-practices.md, form-patterns.md, table-patterns.md | best-practices.md, form-patterns.md, table-patterns.md | = |
| javascript | event-handling.md, state-management.md, fetch-patterns.md | event-handling.md, state-management.md, best-practices.md, fetch-patterns.md | ≠ |

### Verification Signals (Output Files)

| Signal | profileA | profileB | Proves |
|--------|----------|----------|--------|
| `data-rack` | Y | Y | CSS layout-patterns |
| `--seam` | Y | Y | CSS layout-patterns |
| `data-zap` | — | — | CSS animation-patterns |
| `--pulse` | — | — | CSS animation-patterns |
| `data-coat` | — | — | CSS theming |
| `--ink-` | — | — | CSS theming |
| `.plate-` | — | — | CSS theming |
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
| Skills loaded | 1/8 prompts identical |
| Subskill refs | 2/8 prompts identical |
| Tool usage | 0/8 prompts identical |
| Verification signals | 21/26 signals identical |

## Conclusion

Differences detected: skills differed in 7/8 prompts; subskill refs differed in 6/8 prompts; 5/26 verification signals differed. The treatment (profileB) produced different subskill loading or output quality — review per-prompt details above to determine if the change is beneficial.
