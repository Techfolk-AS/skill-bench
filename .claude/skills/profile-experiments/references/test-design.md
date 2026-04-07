# Test Design for A/B Experiments

## Verification Signals

Every reference file should contain **unique, verifiable signals** — specific attributes, function names, class names, or patterns that only appear if Claude read that reference.

### What makes a good signal

- **Unique to one reference** — `data-rack` only proves layout-patterns was read
- **Visible in output** — appears in generated HTML/CSS/JS, not just conceptual
- **Arbitrary** — names Claude would NEVER guess from training data. The signal must be nonsensical/branded enough that it can only come from reading the reference
- **Multiple per reference** — 2-4 signals per reference file, so partial reads are detectable

### Arbitrary naming principle

Signals must be **impossible to infer from training data**. If a convention name is plausible, Claude might generate it without reading the reference — making it useless as a verification signal.

| Quality | Bad (plausible) | Good (arbitrary) | Why bad is bad |
|---------|----------------|-------------------|----------------|
| Layout attr | `data-layout` | `data-rack` | "layout" is obvious for layouts |
| Spacing var | `--gutter` | `--seam` | "gutter" is real CSS terminology |
| Event fn | `wire()` | `zap()` | "wire" sounds like a real event lib |
| Form class | `field-pod` | `flux-pod` | "field" is guessable for form fields |
| Fetch fn | `apiFetch()` | `skyFetch()` | "apiFetch" is a common wrapper name |
| State fn | `createStore()` | `createVault()` | "store" is standard state terminology |

**Test:** If you can explain *why* the name makes sense for its purpose, it's too plausible. Good signals are arbitrary labels that only make sense if you read the reference.

### Signal types

| Type | Example | Good for |
|------|---------|----------|
| Data attributes | `data-rack`, `data-forge-id` | HTML structure conventions |
| Custom properties | `--seam`, `--pulse` | CSS conventions |
| Class names | `flux-pod`, `row-lever`, `plate-elevated` | CSS/HTML patterns |
| Function names | `zap()`, `createVault()`, `skyFetch()` | JS conventions |
| Naming patterns | `on_x_y` snake_case, `/sky/` prefix | Style conventions |

### Anti-patterns

- **Plausible names** — `wire()`, `field-pod`, `apiFetch()` could appear from training knowledge
- Signals shared across multiple references (can't tell which was read)
- Conceptual rules without visible output (e.g. "always use semantic HTML")

## Reference File Design

Each reference file should be a self-contained convention document:

1. **Core convention** — the main pattern, introduced immediately
2. **Code examples** — concrete HTML/CSS/JS showing correct usage
3. **Wrong examples** — what NOT to do (reinforces the convention)
4. **Rules summary** — numbered list at the bottom

### Scaling via references

Add depth to skills by adding reference files, not by expanding SKILL.md.

**SKILL.md stays thin** — routing guide with core rules + when-to-read pointers. Under 50 lines ideally.

**References hold the detail** — each reference = one convention area with full examples.

This means:
- A skill with 2 references = simple binary routing
- A skill with 4 references = nuanced routing decisions = better A/B signal
- SKILL.md complexity stays constant as references grow

### Reference count sweet spot

- **2 references** — trivial routing, weak A/B signal
- **4 references** — good routing variety, strong signal per skill
- **6+ references** — risk of SKILL.md routing section becoming a wall of text

## Test Prompt Categories

### Tier 1: Broad (2 prompts)

Generic tasks that should NOT trigger any specific references. Tests for skill leakage — if `data-layout` or `wire()` appears on a "make me a landing page" prompt, the skill system is too aggressive.

### Tier 2: Single-reference (1 per reference)

Each reference file gets exactly one prompt that directly targets it. This is the baseline — if the reference isn't read for its dedicated prompt, something is broken.

Formula: `N references = N prompts`

### Tier 3: Single-skill multi-reference (1 per skill)

Prompts that need 2 references from the same skill. Tests whether Claude reads multiple references when the task spans concerns within one domain.

Example: "animated theme switcher" → CSS animation-patterns + theming

### Tier 4: Multi-skill (2-3 prompts)

Cross-skill prompts needing references from 2-3 different skills. Tests the full routing system.

Example: "modal contact form with animation" → CSS animation + HTML dialog + HTML form + JS events

### Tier 5: Edge cases (2 prompts)

Prompts that seem related but are outside scope entirely. Tests for false positives.

- Wrong language: "Write a Python script" → no skills
- Explanation not building: "Explain what flexbox is" → no skills

### Prompt count formula

For a template with S skills and R total references:
- Broad: 2
- Single-reference: R
- Single-skill multi-ref: S
- Multi-skill: 2-3
- Edge cases: 2

Total ≈ R + S + 7
