import { existsSync, rmSync, readdirSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");

const projectALogs = join(experimentsDir, "ProjectA/.claude/logs");
const projectBLogs = join(experimentsDir, "ProjectB/.claude/logs");

let cleaned = 0;

for (const logsDir of [projectALogs, projectBLogs]) {
  if (!existsSync(logsDir)) continue;

  const files = readdirSync(logsDir);
  for (const f of files) {
    const fullPath = join(logsDir, f);
    rmSync(fullPath);
    cleaned++;
  }
}

if (cleaned > 0) {
  console.log(`Cleaned ${cleaned} log files from ProjectA and ProjectB.`);
} else {
  console.log("No log files to clean.");
}

for (const logsDir of [projectALogs, projectBLogs]) {
  const projectDir = join(logsDir, "../..");
  if (existsSync(projectDir)) {
    mkdirSync(logsDir, { recursive: true });
  }
}
console.log("Log directories ready for next prompt.");
