import { readFileSync, readdirSync, existsSync, rmSync, lstatSync, mkdirSync, cpSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");
const templateDir = join(experimentsDir, "template");
const scriptsDir = import.meta.dirname!;

function loadEnvFile() {
  const envPath = join(experimentsDir, ".env");
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx);
    const val = trimmed.slice(eqIdx + 1).replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnvFile();

interface TestPrompt {
  number: number;
  tier: number;
  text: string;
}

function parseTestPrompts(filePath: string): TestPrompt[] {
  const content = readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const prompts: TestPrompt[] = [];
  let currentTier = 0;

  for (const line of lines) {
    const tierMatch = line.match(/^## (\d+)\./);
    if (tierMatch) {
      currentTier = parseInt(tierMatch[1], 10);
      continue;
    }
    const promptMatch = line.match(/^(\d+)\.\s+"(.+)"$/);
    if (promptMatch && currentTier > 0) {
      prompts.push({
        number: parseInt(promptMatch[1], 10),
        tier: currentTier,
        text: promptMatch[2],
      });
    }
  }
  return prompts;
}

function getFlagValue(args: string[], flag: string): string | null {
  const found = args.find((a) => a === flag || a.startsWith(flag + "="));
  if (!found) return null;
  const idx = args.indexOf(found);
  return found.includes("=") ? found.split("=")[1] : args[idx + 1] ?? null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
  const nameArg = args.find(
    (a) => !a.startsWith("--") && !/^\d{4}-\d{2}-\d{2}$/.test(a)
  );

  const tierVal = getFlagValue(args, "--tier");
  const promptsVal = getFlagValue(args, "--prompts");
  const timeoutVal = getFlagValue(args, "--timeout");
  const promptsFile = getFlagValue(args, "--prompts-file");
  const imageVal = getFlagValue(args, "--image");
  const docker = args.includes("--docker");

  return {
    date: dateArg ?? new Date().toISOString().split("T")[0],
    name: nameArg ?? null,
    tiers: tierVal ? tierVal.split(",").map(Number) : null,
    promptNumbers: promptsVal ? promptsVal.split(",").map(Number) : null,
    timeout: timeoutVal ? parseInt(timeoutVal, 10) * 1000 : 5 * 60 * 1000,
    promptsFile: promptsFile ?? null,
    imageTag: imageVal ?? "latest",
    docker,
  };
}

function cleanOutputFiles(projectDir: string) {
  if (!existsSync(projectDir)) return;
  const keep = new Set([".claude", "CLAUDE.md", "node_modules", "src", "Dockerfile"]);
  const entries = readdirSync(projectDir);
  for (const entry of entries) {
    if (keep.has(entry) || entry.startsWith("prompt-")) continue;
    const fullPath = join(projectDir, entry);
    const stat = lstatSync(fullPath);
    if (stat.isSymbolicLink()) continue;
    rmSync(fullPath, { recursive: true });
  }
}

function archiveOutputFiles(projectDir: string, promptNumber: number) {
  const keep = new Set([".claude", "CLAUDE.md", "node_modules", "src", "Dockerfile"]);
  const archiveDir = join(projectDir, `prompt-${promptNumber}`);
  mkdirSync(archiveDir, { recursive: true });
  const entries = readdirSync(projectDir);
  for (const entry of entries) {
    if (keep.has(entry) || entry.startsWith("prompt-")) continue;
    const fullPath = join(projectDir, entry);
    const stat = lstatSync(fullPath);
    if (stat.isSymbolicLink()) continue;
    cpSync(fullPath, join(archiveDir, entry), { recursive: true });
  }

  const logsDir = join(projectDir, ".claude", "logs");
  if (existsSync(logsDir)) {
    const archiveLogsDir = join(archiveDir, "logs");
    mkdirSync(archiveLogsDir, { recursive: true });
    for (const logFile of readdirSync(logsDir)) {
      cpSync(join(logsDir, logFile), join(archiveLogsDir, logFile), { recursive: true });
    }
  }
}

function runClaudePrompt(projectDir: string, prompt: string, timeout: number): boolean {
  console.log(`    Running in ${projectDir.split("/").pop()} (host)...`);
  const env = { ...process.env };
  delete env.CLAUDECODE;
  const result = spawnSync("claude", ["-p", prompt, "--dangerously-skip-permissions"], {
    cwd: projectDir,
    timeout,
    env,
    stdio: ["pipe", "pipe", "pipe"],
    encoding: "utf-8",
  });

  if (result.status !== 0 || result.error) {
    const err = result.error?.message ?? result.stderr?.slice(0, 200) ?? "unknown error";
    console.log(`    FAILED: ${err}`);
    return false;
  }
  console.log(`    Done (${(result.stdout?.length ?? 0)} chars output)`);
  return true;
}

function spawnAsync(
  cmd: string,
  args: string[],
  opts: { timeout?: number; encoding?: string } = {}
): Promise<{ status: number | null; stdout: string; stderr: string; error?: Error }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];

    child.stdout.on("data", (chunk) => stdoutChunks.push(chunk));
    child.stderr.on("data", (chunk) => stderrChunks.push(chunk));

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (opts.timeout) {
      timer = setTimeout(() => {
        child.kill("SIGTERM");
        setTimeout(() => child.kill("SIGKILL"), 5000);
      }, opts.timeout);
    }

    child.on("close", (code) => {
      if (timer) clearTimeout(timer);
      resolve({
        status: code,
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
      });
    });

    child.on("error", (err) => {
      if (timer) clearTimeout(timer);
      resolve({
        status: null,
        stdout: Buffer.concat(stdoutChunks).toString("utf-8"),
        stderr: Buffer.concat(stderrChunks).toString("utf-8"),
        error: err,
      });
    });
  });
}

async function runDockerPromptAsync(
  projectDir: string,
  imageName: string,
  imageTag: string,
  prompt: string,
  promptNumber: number,
  variant: string,
  timeout: number
): Promise<boolean> {
  const containerName = `run-${variant}-prompt-${promptNumber}`;
  const fullImage = `${imageName}:${imageTag}`;
  const label = `[${variant.toUpperCase()}-${promptNumber}]`;
  console.log(`  ${label} Starting Docker ${fullImage}...`);

  const checkImage = spawnSync("docker", ["image", "inspect", fullImage], {
    stdio: "pipe",
  });
  if (checkImage.status !== 0) {
    console.log(`  ${label} FAILED: Image ${fullImage} not found.`);
    return false;
  }

  spawnSync("docker", ["rm", "-f", containerName], { stdio: "pipe" });

  const apiKey = process.env.ANTHROPIC_API_KEY ?? "";
  if (!apiKey) {
    console.log(`  ${label} FAILED: ANTHROPIC_API_KEY not set`);
    return false;
  }

  const result = await spawnAsync(
    "docker",
    [
      "run",
      "--name", containerName,
      "-e", `ANTHROPIC_API_KEY=${apiKey}`,
      fullImage,
      "-p", prompt,
      "--dangerously-skip-permissions",
    ],
    { timeout }
  );

  if (result.status !== 0 || result.error) {
    const err = result.error?.message ?? result.stderr?.slice(0, 200) ?? "unknown error";
    console.log(`  ${label} FAILED: ${err}`);
    spawnSync("docker", ["rm", "-f", containerName], { stdio: "pipe" });
    return false;
  }

  console.log(`  ${label} Done (${result.stdout.length} chars output)`);

  const promptDir = join(projectDir, `prompt-${promptNumber}`);
  mkdirSync(promptDir, { recursive: true });

  spawnSync("docker", ["cp", `${containerName}:/project/.`, promptDir], { stdio: "pipe" });

  const logsDir = join(promptDir, "logs");
  mkdirSync(logsDir, { recursive: true });
  spawnSync("docker", ["cp", `${containerName}:/project/.claude/logs/.`, logsDir], { stdio: "pipe" });

  spawnSync("docker", ["rm", "-f", containerName], { stdio: "pipe" });

  console.log(`  ${label} Files copied to prompt-${promptNumber}/`);
  return true;
}

async function runPromptPairAsync(
  prompt: TestPrompt,
  config: { name: string; imageTag: string; timeout: number }
): Promise<{ number: number; text: string; aOk: boolean; bOk: boolean }> {
  const imageA = `experiment-${config.name}-a`;
  const imageB = `experiment-${config.name}-b`;

  const [aOk, bOk] = await Promise.all([
    runDockerPromptAsync(projectA, imageA, config.imageTag, prompt.text, prompt.number, "a", config.timeout),
    runDockerPromptAsync(projectB, imageB, config.imageTag, prompt.text, prompt.number, "b", config.timeout),
  ]);

  return { number: prompt.number, text: prompt.text, aOk, bOk };
}

const config = parseArgs();
const projectA = join(experimentsDir, "ProjectA");
const projectB = join(experimentsDir, "ProjectB");
const testPromptsPath = config.promptsFile
  ? resolve(config.promptsFile)
  : join(templateDir, "TEST-PROMPTS.md");

if (!existsSync(testPromptsPath)) {
  console.error(`Prompts file not found: ${testPromptsPath}`);
  process.exit(1);
}

if (!existsSync(projectA) || !existsSync(projectB)) {
  console.error("experiments/ProjectA or ProjectB not found. Run experiment-start first.");
  process.exit(1);
}

const allPrompts = parseTestPrompts(testPromptsPath);
let prompts = allPrompts;

if (config.tiers) {
  prompts = prompts.filter((p) => config.tiers!.includes(p.tier));
}
if (config.promptNumbers) {
  prompts = prompts.filter((p) => config.promptNumbers!.includes(p.number));
}

const useDocker = config.docker && !!config.name;
if (config.docker && !config.name) {
  console.error("--docker requires --name <experiment-name> to identify images.");
  process.exit(1);
}

console.log(`\n═══ Experiment Runner ═══`);
console.log(`Date: ${config.date}`);
console.log(`Mode: ${useDocker ? `Docker PARALLEL (image tag: ${config.imageTag})` : "Host (sequential)"}`);
console.log(`Prompts: ${prompts.length}/${allPrompts.length}`);
if (config.tiers) console.log(`Tiers: ${config.tiers.join(", ")}`);
if (config.promptNumbers) console.log(`Prompt #s: ${config.promptNumbers.join(", ")}`);
console.log(`Timeout: ${config.timeout / 1000}s per prompt`);
console.log();

async function runDockerMode() {
  console.log("1. Running all prompt pairs in parallel...\n");

  const startTime = Date.now();
  const results = await Promise.all(
    prompts.map((p) => runPromptPairAsync(p, { name: config.name!, imageTag: config.imageTag, timeout: config.timeout }))
  );
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(`\n═══ Run Summary (${elapsed}s total) ═══`);
  for (const r of results) {
    const aStatus = r.aOk ? "OK" : "FAIL";
    const bStatus = r.bOk ? "OK" : "FAIL";
    console.log(`  #${r.number}: A=${aStatus} B=${bStatus} — "${r.text.slice(0, 50)}"`);
  }

  const failed = results.filter((r) => !r.aOk || !r.bOk);
  if (failed.length > 0) {
    console.log(`\n${failed.length} prompt(s) had failures.`);
  }

  console.log("\n2. Generating comparison...");
  spawnSync("npx", ["tsx", join(scriptsDir, "compare-sessions.ts"), config.date], {
    cwd: scriptsDir,
    stdio: "inherit",
  });

  console.log("\n3. Generating report...");
  const reportArgs = [join(scriptsDir, "generate-report.ts"), config.date];
  if (config.name) reportArgs.push(config.name);
  spawnSync("npx", ["tsx", ...reportArgs], {
    cwd: scriptsDir,
    stdio: "inherit",
  });

  if (config.name) {
    console.log("\n4. Grading outputs...");
    spawnSync("npx", ["tsx", join(scriptsDir, "grade-experiment.ts"), config.name, config.date], {
      cwd: scriptsDir,
      stdio: "inherit",
    });

    console.log("\n5. Generating benchmark...");
    spawnSync("npx", ["tsx", join(scriptsDir, "generate-benchmark.ts"), config.name], {
      cwd: scriptsDir,
      stdio: "inherit",
    });

    console.log("\n6. Launching viewer...");
    spawnSync("npx", ["tsx", join(scriptsDir, "launch-viewer.ts"), config.name], {
      cwd: scriptsDir,
      stdio: "inherit",
    });
  }

  console.log("\nExperiment run complete.");
}

if (useDocker) {
  runDockerMode();
} else {
  console.log("1. Cleaning logs...");
  spawnSync("npx", ["tsx", join(scriptsDir, "experiment-clean-logs.ts")], {
    cwd: scriptsDir,
    stdio: "inherit",
  });

  const results: { number: number; text: string; aOk: boolean; bOk: boolean }[] = [];

  for (const prompt of prompts) {
    console.log(`\n── Prompt ${prompt.number} (tier ${prompt.tier}): "${prompt.text.slice(0, 60)}${prompt.text.length > 60 ? "..." : ""}" ──`);

    console.log("  Cleaning output files...");
    cleanOutputFiles(projectA);
    cleanOutputFiles(projectB);

    const aOk = runClaudePrompt(projectA, prompt.text, config.timeout);
    const bOk = runClaudePrompt(projectB, prompt.text, config.timeout);

    console.log("  Archiving output files...");
    if (aOk) archiveOutputFiles(projectA, prompt.number);
    if (bOk) archiveOutputFiles(projectB, prompt.number);

    const aLogs = join(projectA, ".claude", "logs");
    const bLogs = join(projectB, ".claude", "logs");
    if (existsSync(aLogs)) rmSync(aLogs, { recursive: true });
    if (existsSync(bLogs)) rmSync(bLogs, { recursive: true });

    results.push({ number: prompt.number, text: prompt.text, aOk, bOk });
  }

  console.log(`\n═══ Run Summary ═══`);
  for (const r of results) {
    const aStatus = r.aOk ? "OK" : "FAIL";
    const bStatus = r.bOk ? "OK" : "FAIL";
    console.log(`  #${r.number}: A=${aStatus} B=${bStatus} — "${r.text.slice(0, 50)}"`);
  }

  const failed = results.filter((r) => !r.aOk || !r.bOk);
  if (failed.length > 0) {
    console.log(`\n${failed.length} prompt(s) had failures.`);
  }

  console.log("\n2. Generating comparison...");
  spawnSync("npx", ["tsx", join(scriptsDir, "compare-sessions.ts"), config.date], {
    cwd: scriptsDir,
    stdio: "inherit",
  });

  console.log("\n3. Generating report...");
  const reportArgs2 = [join(scriptsDir, "generate-report.ts"), config.date];
  if (config.name) reportArgs2.push(config.name);
  spawnSync("npx", ["tsx", ...reportArgs2], {
    cwd: scriptsDir,
    stdio: "inherit",
  });

  if (config.name) {
    console.log("\n4. Grading outputs...");
    spawnSync("npx", ["tsx", join(scriptsDir, "grade-experiment.ts"), config.name, config.date], {
      cwd: scriptsDir,
      stdio: "inherit",
    });

    console.log("\n5. Generating benchmark...");
    spawnSync("npx", ["tsx", join(scriptsDir, "generate-benchmark.ts"), config.name], {
      cwd: scriptsDir,
      stdio: "inherit",
    });

    console.log("\n6. Launching viewer...");
    spawnSync("npx", ["tsx", join(scriptsDir, "launch-viewer.ts"), config.name], {
      cwd: scriptsDir,
      stdio: "inherit",
    });
  }

  console.log("\nExperiment run complete.");
}
