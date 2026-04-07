---
description: Start an A/B profile experiment from template
argument-hint: [experiment-name]
allowed-tools: Bash(npx tsx:*)
---

Start a new A/B experiment. Read the `profile-experiments` skill first for context.

## Arguments

Parse: "$ARGUMENTS"
- If name provided: use as experiment name (kebab-case)
- If no name: ask user for one

## Steps

1. Run the setup script:

```
npx tsx scripts/experiment-start.ts <name>
```

2. Show the user what was created
3. Ask what change they want to introduce in ProjectB
4. After they describe the change, apply it to `experiments/ProjectB/.claude/settings.json` (or wherever appropriate)
5. Show the test prompts from `experiments/template/TEST-PROMPTS.md`
6. Remind them to run each prompt in both `experiments/ProjectA` and `experiments/ProjectB`

## After Setup

Suggest next actions:
- Edit ProjectB/.claude/ with the experimental change
- Run prompts: `npx tsx scripts/experiment-run.ts --name <name> --docker --tier 2 --prompts 3`
- Or without Docker: `npx tsx scripts/experiment-run.ts --tier 2 --prompts 3`
- Use `/experiment:report` to compare results
