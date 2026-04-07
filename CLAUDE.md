# SkillBench

A/B experimentation framework for Claude Code skill configurations, with a web dashboard for viewing results.

## Structure

```
web/                  Next.js app (Vercel-deployed dashboard)
experiments/          Experiment infrastructure
  template/           Base project scaffold for A/B experiments
  results/            Completed experiment data (reports, grading, logs)
  Dockerfile          Docker isolation for experiment runs
scripts/              Orchestration scripts (TypeScript)
.claude/
  skills/             profile-experiments skill
  commands/           /experiment:* slash commands
```

## Workflows

Run experiments: `/experiment:start`, `/experiment:test`, `/experiment:report`
Publish to dashboard: `/experiment:publish`
Clean up: `/experiment:stop`, `/experiment:clean`

## Web App

Static Next.js site in `web/`. Vercel root directory = `web/`.
Published experiment data lives in `web/src/data/`.

## Available Skills

```
profile-experiments:           A/B experiment workflow, Docker isolation, grading
                               WHEN: running experiments | designing tests | analyzing results | experiment methodology
```
