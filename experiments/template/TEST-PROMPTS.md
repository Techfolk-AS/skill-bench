# Test Prompts

## Verification Signals

| Signal | Proves | Reference |
|--------|--------|-----------|
| `data-rack` attribute | CSS layout-patterns | layout-patterns.md |
| `--seam` variable | CSS layout-patterns | layout-patterns.md |
| `data-zap` attribute | CSS animation-patterns | animation-patterns.md |
| `--pulse` variable | CSS animation-patterns | animation-patterns.md |
| `prefers-reduced-motion` check | CSS animation-patterns | animation-patterns.md |
| `data-coat` on `<html>` | CSS theming | theming.md |
| `--ink-*` properties | CSS theming | theming.md |
| `.plate-*` classes | CSS theming | theming.md |
| `data-forge-id` on form | HTML form-patterns | form-patterns.md |
| `flux-pod` wrapper | HTML form-patterns | form-patterns.md |
| `forge-trigger` class | HTML form-patterns | form-patterns.md |
| `data-hatch-id` on dialog | HTML dialog-patterns | dialog-patterns.md |
| `hatch-trigger` / `data-summons` | HTML dialog-patterns | dialog-patterns.md |
| `hatch-body` / `hatch-dismiss` | HTML dialog-patterns | dialog-patterns.md |
| `data-slab-id` on table | HTML table-patterns | table-patterns.md |
| `data-rankable` on `<th>` | HTML table-patterns | table-patterns.md |
| `row-lever` class | HTML table-patterns | table-patterns.md |
| `slab-hollow` container | HTML table-patterns | table-patterns.md |
| `zap()` function | JS event-handling | event-handling.md |
| `on_x_y` snake_case handlers | JS event-handling | event-handling.md |
| `createVault()` | JS state-management | state-management.md |
| `linkVault(vault, el, fn)` | JS state-management | state-management.md |
| `vault.tap()` | JS state-management | state-management.md |
| `skyFetch()` | JS fetch-patterns | fetch-patterns.md |
| `/sky/` endpoint prefix | JS fetch-patterns | fetch-patterns.md |
| `on_*_landed` / `on_*_crashed` | JS fetch-patterns | fetch-patterns.md |

## 1. Broad (should NOT trigger specific references)

1. "Make me a simple webpage with a header, some content, and a footer"
2. "Create a landing page for a coffee shop"

*Expected: generic HTML/CSS/JS. No `data-rack`, `flux-pod`, `zap()`, etc. If these appear → skill system leaking too broadly.*

## 2. Single-reference

### CSS → layout-patterns

3. "Create a blog layout with a sidebar and main content area"

*Look for: `data-rack="sidebar"`, `--seam`*

### CSS → animation-patterns

4. "Add a fade-in animation to the cards when the page loads"

*Look for: `data-zap="fade-in"`, `--pulse`, `prefers-reduced-motion` gate*

### CSS → theming

5. "Add a dark mode toggle to the site"

*Look for: `data-coat` on `<html>`, `--ink-*` properties, `.plate-*` classes*

### HTML → form-patterns

6. "Create a contact form with name, email, and message fields"

*Look for: `data-forge-id`, `flux-pod` wrappers, `forge-trigger` submit button*

### HTML → dialog-patterns

7. "Create a modal for confirming item deletion"

*Look for: `data-hatch-id`, `hatch-trigger` with `data-summons`, `hatch-body`, `hatch-dismiss`*

### HTML → table-patterns

8. "Build a sortable data table for a list of users"

*Look for: `data-slab-id`, `data-rankable` on `<th>`, `row-lever` buttons, `slab-hollow`*

### JS → event-handling

9. "Add a click handler to toggle a mobile navigation menu"

*Look for: `zap()`, `on_nav_toggle_click` snake_case handler*

### JS → state-management

10. "Add a shopping cart counter that updates live when items are added"

*Look for: `createVault()`, `linkVault(vault, el, fn)`, `vault.tap()`*

### JS → fetch-patterns

11. "Fetch and display a list of products from the API"

*Look for: `skyFetch('/sky/products')`, `on_products_landed`, `on_products_crashed`*

## 3. Single-skill multi-reference

12. "Build an animated theme switcher with smooth transitions between light and dark"

*CSS animation-patterns + theming. Look for: `data-zap`, `--pulse`, `data-coat`, `--ink-*`*

13. "Create an editable table with inline form fields for each row"

*HTML table-patterns + form-patterns. Look for: `data-slab-id`, `data-rankable`, `data-forge-id`, `flux-pod`*

14. "Build a live search that fetches results as you type"

*JS fetch-patterns + event-handling. Look for: `skyFetch()`, `zap()`, `on_search_input`, `on_results_landed`*

## 4. Multi-skill (cross 2-3 skills)

15. "Build a newsletter signup form with a two-column layout"

*CSS layout + HTML form. Look for: `data-rack="sidebar"`, `--seam`, `data-forge-id`, `flux-pod`, `forge-trigger`*

16. "Product listing page with a sortable table, data loaded from API, and dark mode support"

*CSS theming + HTML table + JS fetch. Look for: `data-coat`, `--ink-*`, `data-slab-id`, `data-rankable`, `skyFetch()`, `on_products_landed`*

17. "Modal contact form with animated entrance and real-time field validation"

*CSS animation + HTML dialog + HTML form + JS event. Look for: `data-zap`, `data-hatch-id`, `hatch-body`, `data-forge-id`, `flux-pod`, `zap()`, `on_field_input`*

## 5. Edge cases (should NOT trigger any skills)

18. "Write a Python script to process CSV files"

*Expected: no skills triggered. Python is outside scope.*

19. "Explain what flexbox is"

*Expected: no skills triggered. Asking for explanation, not building anything.*

## 6. Modification (modify existing starter files in src/)

20. "Change the data table to be sortable by clicking column headers"

*Modifies existing table in index.html + app.js. Look for: preserved `data-slab-id`, `data-rankable`, `data-sort-dir`, `row-lever`. Should NOT rewrite from scratch or use vanilla patterns.*

21. "Add a dark mode toggle button that persists the theme choice"

*Modifies existing styles.css + app.js. Look for: preserved `data-coat` on `<html>`, `--ink-*` variables, `createVault()` for persisted state, `zap()` for toggle handler.*

22. "Add form validation to the existing contact form"

*Modifies existing form in index.html + app.js. Look for: preserved `data-forge-id`, `flux-pod` wrappers, `has-error` class on `flux-pod`, `flux-pod__message` for errors, `zap()` for validation handler.*

23. "Replace the sidebar layout with a responsive grid layout"

*Modifies existing layout in index.html + styles.css. Look for: `data-rack` attribute preserved (changed value), `--seam` variable still used. Should NOT use raw CSS grid without data-rack.*

## 7. Refactoring (should still follow conventions)

24. "Refactor the API calls to use async/await with proper error handling"

*Refactors app.js. Look for: `skyFetch()` still used (not replaced with raw fetch), `on_*_landed`/`on_*_crashed` callback pattern preserved, `/sky/` prefix maintained.*

25. "Split app.js into separate modules for each feature"

*Splits app.js. Look for: all conventions preserved across modules — `zap()` in event modules, `createVault()` in state modules, `skyFetch()` in API modules. Should NOT introduce addEventListener or raw fetch.*
