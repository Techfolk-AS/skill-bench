---
description: Clean up an A/B profile experiment
argument-hint: [name] [--keep-logs] [--remove-images] [--dry-run]
allowed-tools: Bash(npx tsx:*)
---

Clean up after an A/B experiment. Read the `profile-experiments` skill first for context.

## Arguments

Parse: "$ARGUMENTS"
- `name`: experiment name (needed for `--remove-images`)
- `--keep-logs`: archive ProjectA/ProjectB logs to `experiments/logs/` before removing
- `--remove-images`: also remove Docker images (`experiment-{name}-a`, `experiment-{name}-b`)
- `--dry-run`: show what would be removed without doing it

## What gets cleaned

- `experiments/ProjectA` + `ProjectB` — removed entirely
- Docker images — kept by default (for regression testing), removed with `--remove-images`
- Experiment logs in `experiments/` — preserved

## Steps

1. First do a dry run to show the user what will be removed:

```
npx tsx scripts/experiment-stop.ts [name] --dry-run
```

2. Ask user to confirm cleanup
3. Run the actual cleanup (pass any flags the user specified):

```
npx tsx scripts/experiment-stop.ts [name] [flags]
```

4. Remind them that experiment logs are preserved, and Docker images are kept unless `--remove-images` was used

## After Cleanup

Suggest:
- Review the experiment log and update Results/Learnings sections
- If the experiment was successful, integrate the change into a production profile
