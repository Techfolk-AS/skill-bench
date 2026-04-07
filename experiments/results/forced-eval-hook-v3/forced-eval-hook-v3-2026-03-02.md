# A/B Experiment Report — 2026-03-02

**profileA** (control): No changes (baseline)
**profileB** (treatment): ProjectB change: Add `skill-forced-eval-hook.sh` that outputs forced evaluation instructions on every prompt, requiring Claude to reason about each skill and activate via Skill tool before proceeding.

## Prompt 1: "Create a blog layout with a sidebar and main content area"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 31 | 25 | ≠ |
| Duration | 250.0s | 81.4s | ≠ |
| Skills loaded | html, css | html, css | = |
| Subskill refs | css → layout-patterns.md, best-practices.md; html → best-practices.md | css → layout-patterns.md; html → best-practices.md | ≠ |
| Tools | Bash(2), Read(6), Skill(2), TodoWrite(3), Write(2) | Edit(1), Glob(1), Read(4), Skill(2), TodoWrite(3), Write(1) | ≠ |
| Signals | 2 | 2 | = |

## Prompt 2: "Create a contact form with name, email, and message fields"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 46 | 43 | ≠ |
| Duration | 138.3s | 190.6s | ≠ |
| Skills loaded | html | css, html, javascript | ≠ |
| Subskill refs | html → form-patterns.md | css → layout-patterns.md; html → form-patterns.md; javascript → event-handling.md | ≠ |
| Tools | Bash(2), Edit(10), Read(6), Skill(1), TodoWrite(4) | Edit(3), Glob(1), Read(6), Skill(3), TodoWrite(6), Write(2) | ≠ |
| Signals | 3 | 7 | ≠ |

## Prompt 3: "Add a click handler to toggle a mobile navigation menu"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 58 | 27 | ≠ |
| Duration | 168.6s | 70.4s | ≠ |
| Skills loaded | javascript | html, css, javascript | ≠ |
| Subskill refs | javascript → event-handling.md | css → best-practices.md; html → best-practices.md; javascript → event-handling.md | ≠ |
| Tools | Agent(1), Bash(4), Edit(5), Glob(1), Read(9), Skill(1), TodoWrite(6), Write(1) | Edit(3), Glob(1), Read(6), Skill(3) | ≠ |
| Signals | 2 | 1 | ≠ |

## Prompt 4: "Build a sortable data table for a list of users"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 50 | 0 | ≠ |
| Duration | 255.5s | 0.0s | ≠ |
| Skills loaded | html, css, javascript | none | ≠ |
| Subskill refs | css → best-practices.md; html → table-patterns.md; javascript → state-management.md, event-handling.md | none | ≠ |
| Tools | Bash(2), Edit(2), Read(8), Skill(3), TodoWrite(7), Write(3) | none | ≠ |
| Signals | 8 | 0 | ≠ |

## Prompt 5: "Fetch and display a list of products from the API"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 67 | 45 | ≠ |
| Duration | 228.5s | 150.5s | ≠ |
| Skills loaded | javascript, html | css, html, javascript | ≠ |
| Subskill refs | html → table-patterns.md; javascript → fetch-patterns.md, state-management.md | css → layout-patterns.md; html → table-patterns.md; javascript → fetch-patterns.md | ≠ |
| Tools | Agent(1), Bash(3), Edit(4), Glob(2), Read(11), Skill(2), TodoWrite(7), Write(2) | Edit(4), Glob(1), Read(6), Skill(3), TodoWrite(6), Write(2) | ≠ |
| Signals | 11 | 13 | ≠ |

## Prompt 7: "Write a Python script to process CSV files"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 3 | 3 | = |
| Duration | 15.8s | 15.8s | = |
| Skills loaded | none | none | = |
| Subskill refs | none | none | = |
| Tools | Write(1) | Write(1) | = |
| Signals | 0 | 0 | = |

## Prompt 8: "Make me a simple webpage with a header, some content, and a footer"

| Metric | profileA | profileB | Match? |
|--------|----------|----------|--------|
| Events | 11 | 11 | = |
| Duration | 15.0s | 20.5s | ≠ |
| Skills loaded | none | html, css | ≠ |
| Subskill refs | none | css → layout-patterns.md; html → best-practices.md | ≠ |
| Tools | Bash(2), Read(3) | Read(2), Skill(2), Write(1) | ≠ |
| Signals | 0 | 2 | ≠ |

## Totals

| Metric | profileA | profileB | Diff |
|--------|----------|----------|------|
| Sessions | 7 | 6 | |
| Prompts | 7 | 6 | |
| Events | 266 | 154 | -112 |
| Skills loaded | html, css, javascript | html, css, javascript | |

### Tool Usage

| Tool | profileA | profileB | Diff |
|------|----------|----------|------|
| Agent | 2 | 0 | -2 |
| Bash | 15 | 0 | -15 |
| Edit | 21 | 11 | -10 |
| Glob | 3 | 4 | +1 |
| Read | 43 | 24 | -19 |
| Skill | 9 | 13 | +4 |
| TodoWrite | 27 | 15 | -12 |
| Write | 9 | 7 | -2 |

### Subskill Reads

| Skill | profileA refs | profileB refs | Match? |
|-------|---------------|---------------|--------|
| css | layout-patterns.md, best-practices.md | layout-patterns.md, best-practices.md | = |
| html | best-practices.md, form-patterns.md, table-patterns.md | best-practices.md, form-patterns.md, table-patterns.md | = |
| javascript | event-handling.md, state-management.md, fetch-patterns.md | event-handling.md, fetch-patterns.md | ≠ |

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
| `data-forge-id` | Y | Y | HTML form-patterns |
| `flux-pod` | Y | Y | HTML form-patterns |
| `forge-trigger` | Y | Y | HTML form-patterns |
| `data-hatch-id` | — | — | HTML dialog-patterns |
| `hatch-trigger` | — | — | HTML dialog-patterns |
| `hatch-body` | — | — | HTML dialog-patterns |
| `data-slab-id` | Y | Y | HTML table-patterns |
| `data-rankable` | Y | Y | HTML table-patterns |
| `row-lever` | Y | Y | HTML table-patterns |
| `slab-hollow` | Y | Y | HTML table-patterns |
| `zap()` | Y | Y | JS event-handling |
| `on_x_y` | Y | Y | JS event-handling |
| `createVault()` | Y | Y | JS state-management |
| `linkVault(` | Y | Y | JS state-management |
| `vault.tap(` | — | — | JS state-management |
| `skyFetch()` | Y | Y | JS fetch-patterns |
| `/sky/` | Y | Y | JS fetch-patterns |
| `_landed` | Y | Y | JS fetch-patterns |
| `_crashed` | Y | Y | JS fetch-patterns |

## Summary

| Dimension | Match rate |
|-----------|------------|
| Skills loaded | 2/7 prompts identical |
| Subskill refs | 1/7 prompts identical |
| Tool usage | 1/7 prompts identical |
| Verification signals | 26/26 signals identical |

## Conclusion

Differences detected: skills differed in 5/7 prompts; subskill refs differed in 6/7 prompts. The treatment (profileB) produced different subskill loading or output quality — review per-prompt details above to determine if the change is beneficial.
