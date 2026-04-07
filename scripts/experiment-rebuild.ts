import { existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");
const dockerfile = join(experimentsDir, "Dockerfile");

function getFlagValue(args: string[], flag: string): string | null {
  const found = args.find((a) => a === flag || a.startsWith(flag + "="));
  if (!found) return null;
  const idx = args.indexOf(found);
  return found.includes("=") ? found.split("=")[1] : args[idx + 1] ?? null;
}

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--"));
const claudeVersion = getFlagValue(args, "--claude-version") ?? "latest";

if (!name) {
  console.error("Usage: npx tsx experiment-rebuild.ts <name> [--claude-version X.Y.Z]");
  console.error("Example: npx tsx experiment-rebuild.ts my-experiment --claude-version 1.2.3");
  process.exit(1);
}

if (!existsSync(dockerfile)) {
  console.error(`Dockerfile not found: ${dockerfile}`);
  process.exit(1);
}

const projectA = join(experimentsDir, "ProjectA");
const projectB = join(experimentsDir, "ProjectB");
const tag = claudeVersion === "latest" ? "latest" : `cli-${claudeVersion}`;

function buildImage(projectDir: string, imageName: string) {
  if (!existsSync(projectDir)) {
    console.log(`  ${projectDir} not found, skipping`);
    return false;
  }

  if (!existsSync(join(projectDir, "Dockerfile"))) {
    console.log(`  No Dockerfile in ${projectDir}, copying from template...`);
    spawnSync("cp", [dockerfile, projectDir]);
  }

  console.log(`  Building ${imageName}:${tag} (CLAUDE_VERSION=${claudeVersion})...`);
  const result = spawnSync(
    "docker",
    [
      "build",
      "--build-arg",
      `CLAUDE_VERSION=${claudeVersion}`,
      "-t",
      `${imageName}:${tag}`,
      projectDir,
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    console.error(`  FAILED to build ${imageName}`);
    return false;
  }
  console.log(`  Built: ${imageName}:${tag}`);
  return true;
}

console.log(`\nRebuilding images for experiment "${name}"`);
console.log(`Claude CLI version: ${claudeVersion}`);
console.log(`Image tag: ${tag}\n`);

const imageA = `experiment-${name}-a`;
const imageB = `experiment-${name}-b`;

console.log("1. Building ProjectA image...");
const aOk = buildImage(projectA, imageA);

console.log("2. Building ProjectB image...");
const bOk = buildImage(projectB, imageB);

if (!aOk && !bOk) {
  console.error("\nNo images built. Ensure ProjectA/B exist (run experiment-start first).");
  process.exit(1);
}

console.log(`\nDone. Images available:`);
if (aOk) console.log(`  ${imageA}:${tag}`);
if (bOk) console.log(`  ${imageB}:${tag}`);
console.log(`\nRun with: npx tsx experiment-run.ts --name ${name} --image ${tag} --tier 2 --prompts 3`);
