import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

interface GradingResult {
  expectations: Array<{ text: string; passed: boolean; evidence: string }>;
  summary: { passed: number; failed: number; total: number; pass_rate: number };
}

interface PromptGrading {
  prompt_number: number;
  prompt_text: string;
  control: GradingResult;
  treatment: GradingResult;
}

interface SideSnapshot {
  events: number;
  durationMs: number;
  skillsLoaded: string[];
  subskillReads: Record<string, string[]>;
  toolCounts: Record<string, number>;
  signals: string[];
}

interface ExperimentReport {
  date: string;
  experiment: { name: string | null; control: string; treatment: string };
  prompts: Array<{ number: number; text: string; control: SideSnapshot | null; treatment: SideSnapshot | null }>;
}

function stats(values: number[]): { mean: number; stddev: number; min: number; max: number } {
  if (values.length === 0) return { mean: 0, stddev: 0, min: 0, max: 0 };
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return { mean: Math.round(mean * 1000) / 1000, stddev: Math.round(Math.sqrt(variance) * 1000) / 1000, min: Math.min(...values), max: Math.max(...values) };
}

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");
const args = process.argv.slice(2);
const experimentName = args[0];

if (!experimentName) {
  console.error("Usage: npx tsx generate-benchmark.ts <experiment-name>");
  process.exit(1);
}

const expDir = join(experimentsDir, "results", experimentName);
const gradingDir = join(expDir, "grading");

if (!existsSync(gradingDir)) {
  console.error(`No grading directory found at ${gradingDir}. Run grade-experiment.ts first.`);
  process.exit(1);
}

const reportFiles = readdirSync(expDir).filter((f) => f.endsWith(".json") && f.includes(experimentName) && !f.includes("benchmark"));
const reportFile = reportFiles.sort().pop();
if (!reportFile) {
  console.error("No experiment report found.");
  process.exit(1);
}
const report: ExperimentReport = JSON.parse(readFileSync(join(expDir, reportFile), "utf-8"));

const promptGradings: PromptGrading[] = [];
for (const file of readdirSync(gradingDir).filter((f) => f.startsWith("prompt-") && f.endsWith(".json")).sort()) {
  promptGradings.push(JSON.parse(readFileSync(join(gradingDir, file), "utf-8")));
}

const runs: Array<Record<string, unknown>> = [];
const controlPassRates: number[] = [];
const treatmentPassRates: number[] = [];
const controlTimes: number[] = [];
const treatmentTimes: number[] = [];

for (const grading of promptGradings) {
  const reportPrompt = report.prompts.find((p) => p.number === grading.prompt_number);
  const controlTime = (reportPrompt?.control?.durationMs ?? 0) / 1000;
  const treatmentTime = (reportPrompt?.treatment?.durationMs ?? 0) / 1000;

  controlPassRates.push(grading.control.summary.pass_rate);
  treatmentPassRates.push(grading.treatment.summary.pass_rate);
  controlTimes.push(controlTime);
  treatmentTimes.push(treatmentTime);

  runs.push({
    eval_id: grading.prompt_number,
    eval_name: `Prompt ${grading.prompt_number}`,
    configuration: "control",
    run_number: 1,
    result: {
      pass_rate: grading.control.summary.pass_rate,
      passed: grading.control.summary.passed,
      total: grading.control.summary.total,
      time_seconds: controlTime,
      events: reportPrompt?.control?.events ?? 0,
      errors: 0,
    },
    expectations: grading.control.expectations,
  });

  runs.push({
    eval_id: grading.prompt_number,
    eval_name: `Prompt ${grading.prompt_number}`,
    configuration: "treatment",
    run_number: 1,
    result: {
      pass_rate: grading.treatment.summary.pass_rate,
      passed: grading.treatment.summary.passed,
      total: grading.treatment.summary.total,
      time_seconds: treatmentTime,
      events: reportPrompt?.treatment?.events ?? 0,
      errors: 0,
    },
    expectations: grading.treatment.expectations,
  });
}

const controlPassStats = stats(controlPassRates);
const treatmentPassStats = stats(treatmentPassRates);
const controlTimeStats = stats(controlTimes);
const treatmentTimeStats = stats(treatmentTimes);

const notes: string[] = [];
const delta = treatmentPassStats.mean - controlPassStats.mean;
if (Math.abs(delta) < 0.05) notes.push("Pass rates are within 5% - treatment may not have meaningful impact");
if (delta > 0.2) notes.push(`Treatment improves pass rate by ${(delta * 100).toFixed(0)}% - strong positive signal`);
if (delta < -0.1) notes.push(`Treatment degrades pass rate by ${(Math.abs(delta) * 100).toFixed(0)}% - negative impact`);

const alwaysPass = promptGradings.filter((g) => g.control.summary.pass_rate === 1 && g.treatment.summary.pass_rate === 1);
if (alwaysPass.length > 0) notes.push(`${alwaysPass.length} prompt(s) pass 100% on both sides - assertions may not discriminate`);

const timeDelta = treatmentTimeStats.mean - controlTimeStats.mean;
if (Math.abs(timeDelta) > 5) notes.push(`Treatment ${timeDelta > 0 ? "adds" : "saves"} ${Math.abs(timeDelta).toFixed(1)}s average execution time`);

const benchmark = {
  metadata: {
    experiment_name: experimentName,
    control_description: report.experiment.control,
    treatment_description: report.experiment.treatment,
    timestamp: new Date().toISOString(),
    prompts_evaluated: promptGradings.length,
  },
  runs,
  run_summary: {
    control: { pass_rate: controlPassStats, time_seconds: controlTimeStats },
    treatment: { pass_rate: treatmentPassStats, time_seconds: treatmentTimeStats },
    delta: {
      pass_rate: `${delta >= 0 ? "+" : ""}${(delta * 100).toFixed(1)}%`,
      time_seconds: `${timeDelta >= 0 ? "+" : ""}${timeDelta.toFixed(1)}s`,
    },
  },
  notes,
};

const outPath = join(expDir, `${experimentName}-benchmark.json`);
writeFileSync(outPath, JSON.stringify(benchmark, null, 2));

console.log(`Benchmark written to: ${outPath}`);
console.log(`  Control avg pass rate:   ${(controlPassStats.mean * 100).toFixed(1)}% (±${(controlPassStats.stddev * 100).toFixed(1)}%)`);
console.log(`  Treatment avg pass rate: ${(treatmentPassStats.mean * 100).toFixed(1)}% (±${(treatmentPassStats.stddev * 100).toFixed(1)}%)`);
console.log(`  Delta: ${benchmark.run_summary.delta.pass_rate}`);
if (notes.length > 0) {
  console.log(`  Notes:`);
  for (const note of notes) console.log(`    - ${note}`);
}
