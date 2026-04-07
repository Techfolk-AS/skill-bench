---
description: Compare A/B experiment logs and generate report
argument-hint: [date] [experiment-name]
allowed-tools: Bash(npx tsx:*)
---

Compare profileA vs profileB logs and generate a report. Read the `profile-experiments` skill first for context.

## Arguments

Parse: "$ARGUMENTS"
- If date provided: use it (format: YYYY-MM-DD)
- If no date: use today's date
- If experiment name provided: pass it to generate-report.ts
- If no name: script auto-detects active experiment (Status: testing + matching date)

## Steps

1. Run the terminal comparison:

```
npx tsx scripts/compare-sessions.ts <date>
```

2. Generate the full markdown report:

```
npx tsx scripts/generate-report.ts <date> [experiment-name]
```

The script accepts args in any order (date detected by YYYY-MM-DD pattern, name is the other arg).
Report is saved as `<experiment-name>-<date>.md` or `report-<date>.md` if no experiment found.

3. Show key findings to the user:
   - Did skills differ?
   - Did subskill reads differ?
   - Any verification signal differences?
4. If an experiment log exists in `experiments/`, offer to update it with the results
