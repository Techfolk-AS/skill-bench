---
description: Publish experiment results to SkillBench
argument-hint: [experiment-name]
---

Publish an experiment's results to SkillBench for deployment.

## Arguments

- `$ARGUMENTS` = experiment name (e.g. `forced-eval-hook-v4`)

## Instructions

1. If no argument provided, list unpublished experiments:
   - Scan `experiments/results/` for directories containing JSON report files
   - Check which ones don't have a corresponding directory in `web/src/data/`
   - Show the list and ask which to publish

2. With experiment name argument:
   - Find the main report JSON in `experiments/results/$ARGUMENTS/` (the file matching ExperimentReport shape, NOT the benchmark file -- look for a file with `version`, `date`, `experiment`, `prompts`, `totals`, `signalMap`, `summary` keys)
   - Find grading files if they exist: `grading/prompt-*.json` and `grading/grading-summary.json`
   - Create `web/src/data/$ARGUMENTS/` directory
   - Copy report as `report.json`
   - If grading files exist, create `grading/` subdirectory and copy them preserving names
   - Validate: read back `report.json` and confirm it has required fields (version, experiment, prompts)
   - Git add, commit with message `publish: $ARGUMENTS`, push to main

3. After push, inform user that Vercel will auto-deploy
