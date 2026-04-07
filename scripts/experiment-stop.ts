import { existsSync, rmSync, cpSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");

const projectA = join(experimentsDir, "ProjectA");
const projectB = join(experimentsDir, "ProjectB");

const args = process.argv.slice(2);
const name = args.find((a) => !a.startsWith("--")) ?? null;
const dryRun = args.includes("--dry-run");
const keepLogs = args.includes("--keep-logs");
const removeImages = args.includes("--remove-images");

function safeRemoveDir(path: string, label: string) {
  if (!existsSync(path)) {
    console.log(`  ${label}: not found, skipping`);
    return;
  }
  if (dryRun) {
    console.log(`  [dry-run] Would remove: ${path}`);
  } else {
    rmSync(path, { recursive: true });
    console.log(`  Removed: ${path}`);
  }
}

function copyLogs(projectPath: string, label: string) {
  const logsDir = join(projectPath, ".claude", "logs");
  if (!existsSync(logsDir)) return;

  const archiveDir = name
    ? join(experimentsDir, "results", name, "logs", label)
    : join(experimentsDir, "logs", label);

  if (dryRun) {
    console.log(`  [dry-run] Would archive logs: ${logsDir} → ${archiveDir}`);
  } else {
    mkdirSync(archiveDir, { recursive: true });
    cpSync(logsDir, archiveDir, { recursive: true });
    console.log(`  Archived logs: ${archiveDir}`);
  }
}

if (dryRun) console.log("DRY RUN — no changes will be made\n");

console.log("1. Archiving logs...");
if (keepLogs) {
  copyLogs(projectA, "ProjectA");
  copyLogs(projectB, "ProjectB");
} else {
  console.log("  Skipping (use --keep-logs to archive)");
}

console.log("2. Removing projects...");
safeRemoveDir(projectA, "ProjectA");
safeRemoveDir(projectB, "ProjectB");

console.log("3. Docker images...");
if (removeImages && name) {
  const imageA = `experiment-${name}-a`;
  const imageB = `experiment-${name}-b`;
  for (const img of [imageA, imageB]) {
    if (dryRun) {
      console.log(`  [dry-run] Would remove image: ${img}`);
    } else {
      const result = spawnSync("docker", ["rmi", img], { stdio: "pipe", encoding: "utf-8" });
      if (result.status === 0) {
        console.log(`  Removed image: ${img}`);
      } else {
        console.log(`  Image ${img} not found or already removed`);
      }
    }
  }
} else if (removeImages && !name) {
  console.log("  --remove-images requires experiment name. Usage: experiment-stop <name> --remove-images");
} else {
  console.log("  Keeping images (use --remove-images <name> to clean up)");
}

console.log(`\n${dryRun ? "Dry run complete." : "Cleanup complete."} Experiment logs preserved in experiments/.`);
