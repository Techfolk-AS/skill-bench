---
description: Run end-to-end A/B experiment from hypothesis to report
argument-hint: <article/claim/idea to test>
---

Run a full A/B experiment lifecycle. Read the `profile-experiments` skill first for context.

## Arguments

Parse: "$ARGUMENTS"
- The input is an article URL, claim, blog post excerpt, or idea to test

## Flow

### Step 1: Hypothesis

Analyze the input. Formulate:
- **Hypothesis**: What specific behavior change do you expect?
- **Experiment name**: kebab-case, max 4 words (e.g., `skill-triggers-in-hook`)
- **Treatment**: What change to ProjectB would test this?

Show the hypothesis and experiment name. Ask user to confirm or adjust before proceeding.

### Step 2: Start experiment

Run the setup script:

```
npx tsx scripts/experiment-start.ts <name>
```

Then fill in the experiment log at `experiments/results/<name>/log.md`:
- `## Hypothesis` — one-line hypothesis from Step 1
- `## Implementation` — `ProjectB change:` line describing the treatment
- `**Source:**` — the article URL or claim being tested

The report generator reads these for the header, so they must be filled in.

### Step 3: Apply treatment

Based on the hypothesis, determine what changes to make in `experiments/ProjectB/.claude/`.

- Show the exact diff of what you'll change
- Wait for user confirmation before applying
- Apply changes using Edit tool on the appropriate ProjectB files
- Save treatment diff to `experiments/results/<name>/treatment.diff`

### Step 4: Design test prompts

Design test prompts **specific to the hypothesis**. The prompts should:
- Test whether the treatment actually produces the expected behavior change
- Include positive cases (should trigger the change) AND negative cases (should NOT be affected)
- Cover edge cases relevant to the hypothesis
- Use the same numbered format as `experiments/template/TEST-PROMPTS.md`

Write prompts to `experiments/results/<name>/prompts.md` using this format:

```markdown
# Test Prompts — <experiment name>

## 1. Should trigger treatment

1. "prompt text here"
2. "another prompt"

## 2. Should NOT trigger treatment

3. "control prompt"
4. "another control"
```

Show the prompts to the user for confirmation. Ask if they want all or a subset.

### Step 5: Run tests

Run:

```
npx tsx scripts/experiment-run.ts <date> <name> --docker --name <name> --prompts-file experiments/results/<name>/prompts.md [--prompts X,Y,Z]
```

This will take a while. The script handles: log cleaning → output cleaning → running claude -p in both projects → comparison → report generation.

### Step 6: Analyze

After the run completes:
1. Read the generated report from `experiments/results/<name>/<name>-<date>.md`
2. Read event logs directly if report lacks detail
3. Present key findings:
   - Did the treatment produce the expected behavior change?
   - Positive prompts: did they trigger the treatment correctly?
   - Negative prompts: were they unaffected as expected?
   - Any unexpected side effects?
4. Write insights to `## Insights` section in `experiments/results/<name>/log.md` as numbered list. These appear in the HTML viewer and reports.
5. Update the experiment log with results in `## Results`

### Step 7: Stop & next steps

Run cleanup:
```
npx tsx scripts/experiment-stop.ts <name> --keep-logs
```

Ask the user what to do next:
- **Iterate**: Go back to Step 3 with a modified treatment
- **Integrate**: Apply the successful pattern to the production profile (e.g., `profiles/code/`)
- **Done**: `/learn` to document findings, `/branch-commit-push` to commit
