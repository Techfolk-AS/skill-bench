import { cpSync, mkdirSync, existsSync, writeFileSync, copyFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");
const templateDir = join(experimentsDir, "template");

const name = process.argv[2];
if (!name) {
  console.error("Usage: npx tsx experiment-start.ts <experiment-name>");
  console.error("Example: npx tsx experiment-start.ts userpromptsubmit-routing");
  process.exit(1);
}

if (!existsSync(templateDir)) {
  console.error(`Template not found: ${templateDir}`);
  process.exit(1);
}

const projectA = join(experimentsDir, "ProjectA");
const projectB = join(experimentsDir, "ProjectB");

if (existsSync(projectA) || existsSync(projectB)) {
  console.error("ProjectA or ProjectB already exists. Run experiment-stop first.");
  process.exit(1);
}

console.log("1. Creating ProjectA and ProjectB from template...");
cpSync(templateDir, projectA, { recursive: true, filter: (src) => !src.endsWith("TEST-PROMPTS.md") });
cpSync(templateDir, projectB, { recursive: true, filter: (src) => !src.endsWith("TEST-PROMPTS.md") });

console.log("2. Checking Docker and building images...");
const dockerCheck = spawnSync("docker", ["info"], { stdio: "pipe" });
if (dockerCheck.status !== 0) {
  console.error("ERROR: Docker daemon is not running. Start Docker Desktop and try again.");
  console.error("Docker is required for experiment isolation and regression testing.");
  spawnSync("rm", ["-rf", projectA, projectB]);
  process.exit(1);
}

const dockerfile = join(experimentsDir, "Dockerfile");
if (!existsSync(dockerfile)) {
  console.error(`ERROR: Dockerfile not found at ${dockerfile}`);
  spawnSync("rm", ["-rf", projectA, projectB]);
  process.exit(1);
}

copyFileSync(dockerfile, join(projectA, "Dockerfile"));
copyFileSync(dockerfile, join(projectB, "Dockerfile"));

const imageA = `experiment-${name}-a`;
const imageB = `experiment-${name}-b`;

const buildA = spawnSync("docker", ["build", "-t", imageA, projectA], { stdio: "inherit" });
if (buildA.status !== 0) {
  console.error(`ERROR: Failed to build ${imageA}.`);
  spawnSync("rm", ["-rf", projectA, projectB]);
  process.exit(1);
}
console.log(`   Built: ${imageA}`);

const buildB = spawnSync("docker", ["build", "-t", imageB, projectB], { stdio: "inherit" });
if (buildB.status !== 0) {
  console.error(`ERROR: Failed to build ${imageB}.`);
  spawnSync("rm", ["-rf", projectA, projectB]);
  process.exit(1);
}
console.log(`   Built: ${imageB}`);

console.log("3. Creating experiment log...");
const expDir = join(experimentsDir, "results", name);
mkdirSync(expDir, { recursive: true });
const logPath = join(expDir, "log.md");
const today = new Date().toISOString().split("T")[0];
const cliVersion = spawnSync("docker", ["run", "--rm", imageA, "claude", "--version"], { encoding: "utf-8" }).stdout?.trim() || "unknown";
if (!existsSync(logPath)) {
  const date = today;
  const template = `# Experiment: ${name}

**Date:** ${date}
**Profiles:** ProjectA (control) vs ProjectB (treatment)
**CLI:** ${cliVersion}
**Source:**
**Status:** testing

## Hypothesis



## Implementation

ProjectB change:


## Test Prompts

| # | Prompt | A: Skills | B: Skills | A: Subskill refs | B: Subskill refs | A: Signals | B: Signals |
|---|--------|-----------|-----------|-------------------|-------------------|------------|------------|
| 1 | | | | | | | |
| 2 | | | | | | | |
| 3 | | | | | | | |

## Results



## Insights



## Learnings

`;
  writeFileSync(logPath, template);
  console.log(`   Created: ${logPath}`);
} else {
  console.log(`   Already exists: ${logPath}`);
}

console.log(`
Done! Experiment "${name}" is ready.

  ProjectA (control):   ${projectA}
  ProjectB (treatment): ${projectB}
  Experiment log:       ${logPath}

Next steps:
  1. Edit ProjectB/.claude/ to introduce the change
  2. Run: npx tsx experiment-run.ts --name ${name} --tier 2 --prompts 3
  3. Or rebuild with specific CLI: npx tsx experiment-rebuild.ts ${name} --claude-version X.Y.Z
`);
