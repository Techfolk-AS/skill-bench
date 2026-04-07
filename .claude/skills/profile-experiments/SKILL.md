---
name: profile-experiments
description: Track experiments with Claude Code configurations - what was tried, what worked, what didn't. Use when documenting experiment results, reviewing past experiments, or evaluating new configuration patterns.
summary: experiment tracking, config evaluation
triggers: documenting experiment results | reviewing past experiments | evaluating new patterns
---

# Profile Experiments

Track and document experiments with Claude Code configurations.

## A/B Experiment Workflow

Three commands manage the full lifecycle:

| Command                                                   | Purpose                                                               |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `/experiment:test <claim>`                                | End-to-end: hypothesis → start → treatment → run → report             |
| `/experiment:start [name]`                                | Create ProjectA + ProjectB from template, create experiment log       |
| `/experiment:report [date]`                               | Compare logs and generate markdown report                             |
| `/experiment:clean`                                       | Wipe log files in both profiles (does NOT clear conversation context) |
| `/experiment:stop [name] [--keep-logs] [--remove-images]` | Clean up ProjectA/B, optionally remove Docker images                  |

### How it works

1. `/experiment:start my-experiment` — copies template to ProjectA/B, builds Docker images, creates `experiments/my-experiment/log.md`
2. Edit `ProjectB/.claude/` (treatment) — introduce the change being tested
3. Save treatment as `experiments/{name}/treatment.diff`, prompts as `experiments/{name}/prompts.md`
4. Run prompts: `npx tsx experiment-run.ts --name my-experiment --docker --prompts-file experiments/results/{name}/prompts.md`
5. Report auto-generated to `experiments/{name}/{name}-{date}.md`
6. `/experiment:stop my-experiment --keep-logs` — remove ProjectA/B, archive logs to `experiments/{name}/logs/`
7. `/experiment:stop my-experiment --remove-images` — also remove Docker images

### Template contents (`experiments/template/`)

- `src/` — vanilla starter project (index.html, styles.css, app.js) — zero custom conventions, only standard HTML/CSS/JS
- `.claude/settings.json` — base settings with event logging hooks
- `.claude/skills/` — test skills (css, html, javascript) with references
- `.claude/hooks/` — event-logger.ts, skill-index-session.sh, package.json
- `.claude/commands/` — skill-usage command
- `CLAUDE.md` — minimal project description + skill-index placeholder
- `TEST-PROMPTS.md` — standardized prompts with verification signals

### Test prompt categories (7 tiers)

1. **Broad** — generic tasks, should NOT trigger specific references
2. **Single-reference** — each reference gets 1 direct prompt
3. **Single-skill multi-reference** — 2 references from same skill
4. **Multi-skill** — cross 2-3 skills
5. **Edge cases** — seem related but shouldn't trigger any skill
6. **Modification** — modify existing starter files (should preserve conventions)
7. **Refactoring** — restructure code (should still follow conventions)

For full methodology (verification signals, reference design, scaling), read `references/test-design.md`.

## Ideas to Test

Backlog of configurations to experiment with.

| # | Idea | Source | Priority |
|---|------|--------|----------|
| 1 | ~~CLAUDE.md index with "read before task" instruction~~ | [alexop.dev](https://alexop.dev/posts/stop-bloating-your-claude-md-progressive-disclosure-ai-coding-tools/) | done +67-86% |
| 2 | ~~Keyword-dense descriptions vs natural language~~ | [leehanchung](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/) | done -89% |
| 3 | ~~Hook-based prompt scanning for skill injection~~ | [paddo.dev](https://paddo.dev/blog/claude-skills-hooks-solution/) | done neutral |
| 4 | ~~paths: frontmatter auto-activation~~ | [Claude Code docs](https://code.claude.com/docs/en/skills) | done -7.4% |
| 5 | ~~Reference filename descriptiveness~~ | [Medium](https://medium.com/@quanap5/claude-code-progressive-disclosure-insights-from-my-learning-5244bc9864aa) | done -1.8% |
| 6 | ~~Short vs long descriptions (domain term removal)~~ | [heyuan110](https://www.heyuan110.com/posts/ai/2026-02-28-claude-code-skills-guide/) | done -50-67% |
| 7 | Pure routing SKILL.md (only steps + ref links) vs mixed body with inline context | [MindStudio](https://www.mindstudio.ai/blog/claude-code-skills-architecture-skill-md-reference-files) | high |
| 8 | "Gotchas / Common failures" framing vs "Rules / Best practices" framing | [mellanon](https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d) | high |
| 9 | Table of contents at top of reference files vs raw content start | [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | high |
| 10 | Concrete examples in description field vs prose-only descriptions | [mellanon](https://gist.github.com/mellanon/50816550ecb5f3b239aa77eef7b8ed8d) | high |
| 11 | Mixed instruction precision (strict/open) vs uniform imperative style | [Anthropic Best Practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | high |
| 12 | Domain-partitioned references (4 small files) vs single monolithic reference | [Anthropic BigQuery](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) | medium |
| 13 | disable-model-invocation on manual-only skills: cross-skill selection accuracy | [GitHub #19141](https://github.com/anthropics/claude-code/issues/19141) | medium |
| 14 | context: fork for research/analysis skills vs default context | [leehanchung](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/) | medium |

## Docker Isolation

Experiments run in Docker containers for full isolation between A/B runs.

### Image strategy

- Images per experiment: `experiment-{name}-a` and `experiment-{name}-b`
- Built automatically by `experiment-start`
- Persist after `experiment-stop` (for regression testing)
- Rebuild with different CLI: `npx tsx experiment-rebuild.ts {name} --claude-version X.Y.Z`
- Tag convention: `latest` (default) or `cli-X.Y.Z` (version-specific)

### Dockerfile (`experiments/Dockerfile`)

Base: `node:22-slim` + Claude CLI + tsx. Project files baked in. ENTRYPOINT is `claude`.

### Running with Docker

```
npx tsx experiment-run.ts --name my-experiment --docker --tier 2 --prompts 3
```

- Named containers: `run-a-prompt-N`, `run-b-prompt-N`
- `ANTHROPIC_API_KEY` passed from host env
- After each run: `docker cp` extracts all created files back to host
- Container removed after extraction

### Regression testing

Rebuild images with different CLI versions to compare behavior:

```
npx tsx experiment-rebuild.ts my-experiment --claude-version 1.2.3
npx tsx experiment-run.ts --name my-experiment --docker --image cli-1.2.3 --tier 2
```

## Automated Grading

After Docker runs complete, the pipeline grades each prompt's outputs against assertions.

### Assertions

Assertions are verifiable expectations per prompt. Two sources:

1. **Auto-generated** (default) from verification signals detected in outputs
2. **Custom** via `experiments/{name}/assertions.json`

Custom assertions format:

```json
{
  "default_assertions": [
    { "text": "Prompt completed successfully", "type": "completed" }
  ],
  "prompts": {
    "3": {
      "assertions": [
        { "text": "CSS layout signal present", "type": "signal_present", "signal": "data-rack" },
        { "text": "No JS event leakage", "type": "signal_absent", "signal": "zap()" },
        { "text": "CSS skill triggered", "type": "skill_triggered", "skill": "css" },
        { "text": "Layout reference read", "type": "reference_read", "reference": "layout-patterns.md" }
      ]
    }
  }
}
```

Assertion types: `signal_present`, `signal_absent`, `skill_triggered`, `reference_read`, `completed`, `custom`.

### Grading output

Per-prompt: `experiments/{name}/grading/prompt-N.json`
Summary: `experiments/{name}/grading/grading-summary.json`

### Benchmark

`experiments/{name}/{name}-benchmark.json` aggregates grading with mean/stddev/delta stats. Auto-flags:
- Non-discriminating assertions (100% pass both sides)
- Strong positive/negative signals (>20%/10% delta)
- Time cost of treatment

### HTML Viewer

`launch-viewer.ts` generates a standalone HTML file at `/tmp/experiment-viewer-{name}.html` and opens it in the browser. Two tabs:

- **Outputs** tab: navigate per-prompt with arrow keys. Each shows control vs treatment side-by-side with events, duration, skills, signals, and graded assertions
- **Benchmark** tab: aggregate stats table + per-prompt breakdown + analysis notes

Feedback textarea per prompt, exportable as `feedback.json` for experiment conclusions.

Run standalone: `npx tsx scripts/launch-viewer.ts <experiment-name>`

## Experiment Artifacts

What to save after an experiment (Docker images handle reproducibility):

| Artifact       | Path                                             | Purpose                                   |
| -------------- | ------------------------------------------------ | ----------------------------------------- |
| Experiment log | `experiments/{name}/log.md`                      | Hypothesis, results, learnings            |
| Treatment diff | `experiments/{name}/treatment.diff`              | Human-readable change applied to ProjectB |
| Prompts file   | `experiments/{name}/prompts.md`                  | Exact prompts for re-running              |
| Assertions     | `experiments/{name}/assertions.json`             | Custom per-prompt assertions (optional)   |
| Report         | `experiments/{name}/{name}-{date}.md`            | Per-prompt comparison with signals        |
| Grading        | `experiments/{name}/grading/prompt-N.json`       | Per-prompt pass/fail with evidence        |
| Grading sum    | `experiments/{name}/grading/grading-summary.json`| Aggregate pass rates, delta               |
| Benchmark      | `experiments/{name}/{name}-benchmark.json`       | Stats with mean/stddev/delta              |
| Archived logs  | `experiments/{name}/logs/ProjectA/`, `ProjectB/` | Raw event logs (via `--keep-logs`)        |

Output archives (`prompt-N/` dirs) are throwaway — Docker re-run regenerates them.

## Automated Runner

`/experiment:test <article/claim>` runs the full lifecycle: hypothesis → start → treatment → test prompts → report → next steps.

**experiment-run.ts** automates running prompts in both projects:

```
npx tsx experiment-run.ts [date] [name] [--docker] [--name name] [--image tag] [--prompts-file path] [--tier 2,3] [--prompts 3,5,7] [--timeout 600]
```

- `--docker` — run in Docker containers (requires `--name`)
- `--name` — experiment name (for Docker image lookup)
- `--image` — image tag, default `latest` (e.g. `cli-1.2.3`)
- `--prompts-file` — use hypothesis-specific prompts instead of template TEST-PROMPTS.md
- Archives output files to `prompt-N/` subdirs after each prompt pair
- Reports saved to `experiments/results/{name}/`

## A/B Comparison Scripts

- **compare-sessions.ts** — Side-by-side terminal output: skills loaded, subskill reads, tool counts, key differences
- **generate-report.ts** — Full markdown report with per-prompt signals, subskill reads table, and verification signals
- **grade-experiment.ts** — Grades each prompt's outputs against assertions, produces per-prompt grading.json
- **generate-benchmark.ts** — Aggregates grading results into benchmark.json with mean/stddev/delta stats
- **launch-viewer.ts** — Generates standalone HTML viewer with side-by-side comparison, opens in browser
- **experiment-run.ts** — Automated runner: runs prompts → report → grade → benchmark → viewer

Logs: `experiments/ProjectA/.claude/logs/` and `ProjectB/.claude/logs/`. Output signals scanned from `experiments/Project{A,B}/prompt-N/` subdirs.

## Gotchas

1. **`CLAUDECODE` env var blocks nested sessions** — `experiment-run.ts` must `delete env.CLAUDECODE` before spawning child `claude -p` processes. Without this, every prompt fails with "cannot launch inside another session".

2. **Output files destroyed between prompts** — the runner cleans output files before each prompt so results don't bleed. But the report scanner runs after ALL prompts. Fix: archive to `prompt-N/` subdirs after each prompt pair, scan those in the report.

3. **`startsWith` flag collision** — `--prompts` matched `--prompts-file` with naive `startsWith` check. Fix: `a === flag || a.startsWith(flag + "=")`.

4. **Test prompts must match hypothesis** — template TEST-PROMPTS.md tests template skill signals. Custom experiments need custom prompts. Use `--prompts-file` with hypothesis-specific prompts.

5. **Report headers from experiment log** — `generate-report.ts` reads `## Hypothesis` and `## Implementation` from the experiment log. Fill these in after `experiment-start.ts` runs.

6. **`require()` in ESM modules** — use top-level imports, not `require()` inside function bodies. ESM doesn't support `require`.

7. **Docker is required** — `experiment-start.ts` fails if Docker daemon isn't running. Host mode produces no reproducible artifacts and lacks isolation between runs.

8. **Event log duplication across prompts** — Docker `cp` overwrites `.claude/logs/` each run, but `archiveOutputFiles` copies it to `prompt-N/logs/`. If `.claude/logs/` isn't cleared after archiving, the report generator double-counts the last prompt's events. The runner now clears logs after each archive and skips archiving on failed prompts. The report generator prefers `prompt-N/logs/` over the main log when both exist.

9. **Report prompt alignment by number, not position** — When a prompt fails for one side (e.g., A times out on prompt 6), the runner skips archiving it. If the report aligns A and B by position, all subsequent prompts misalign (A's prompt 7 compared against B's prompt 6). `generate-report.ts` uses `collectPromptGroups` which reads `prompt-N/` directory numbers directly, so prompt 6 shows A=empty/B=data without shifting the rest.

## Evaluation Criteria

When testing a new pattern, evaluate:

1. **Effectiveness** - Does it improve the workflow?
2. **Reliability** - Does it work consistently?
3. **Complexity** - Is the setup worth the benefit?
4. **Maintainability** - Easy to update and debug?
5. **Transferability** - Works across different projects?

Score each 1-5. Patterns scoring 4+ across all criteria should be integrated.
