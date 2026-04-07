import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

interface Assertion {
  text: string;
  type: "signal_present" | "signal_absent" | "skill_triggered" | "reference_read" | "completed" | "custom";
  signal?: string;
  skill?: string;
  reference?: string;
}

interface GradingResult {
  expectations: Array<{ text: string; passed: boolean; evidence: string }>;
  summary: { passed: number; failed: number; total: number; pass_rate: number };
}

interface AssertionsConfig {
  default_assertions: Assertion[];
  prompts: Record<string, { assertions: Assertion[] }>;
}

interface SideSnapshot {
  events: number;
  durationMs: number;
  skillsLoaded: string[];
  subskillReads: Record<string, string[]>;
  toolCounts: Record<string, number>;
  signals: string[];
}

interface PromptResult {
  number: number;
  text: string;
  control: SideSnapshot | null;
  treatment: SideSnapshot | null;
}

interface ExperimentReport {
  version: number;
  date: string;
  experiment: { name: string | null; control: string; treatment: string };
  prompts: PromptResult[];
  signalMap: Record<string, { control: boolean; treatment: boolean; proves: string }>;
}

function gradeSnapshot(snapshot: SideSnapshot | null, assertions: Assertion[]): GradingResult {
  if (!snapshot) {
    return {
      expectations: assertions.map((a) => ({ text: a.text, passed: false, evidence: "No data (run failed or missing)" })),
      summary: { passed: 0, failed: assertions.length, total: assertions.length, pass_rate: 0 },
    };
  }

  const results = assertions.map((assertion) => {
    switch (assertion.type) {
      case "signal_present": {
        const found = snapshot.signals.includes(assertion.signal!);
        return { text: assertion.text, passed: found, evidence: found ? `Signal "${assertion.signal}" found in output` : `Signal "${assertion.signal}" not found. Present signals: ${snapshot.signals.join(", ") || "none"}` };
      }
      case "signal_absent": {
        const found = snapshot.signals.includes(assertion.signal!);
        return { text: assertion.text, passed: !found, evidence: found ? `Signal "${assertion.signal}" unexpectedly found in output (leakage)` : `Signal "${assertion.signal}" correctly absent` };
      }
      case "skill_triggered": {
        const loaded = snapshot.skillsLoaded.includes(assertion.skill!);
        return { text: assertion.text, passed: loaded, evidence: loaded ? `Skill "${assertion.skill}" was loaded` : `Skill "${assertion.skill}" not loaded. Loaded: ${snapshot.skillsLoaded.join(", ") || "none"}` };
      }
      case "reference_read": {
        const refs = Object.entries(snapshot.subskillReads).flatMap(([skill, files]) => files.map((f) => `${skill}/${f}`));
        const found = refs.some((r) => r.includes(assertion.reference!));
        return { text: assertion.text, passed: found, evidence: found ? `Reference "${assertion.reference}" was read` : `Reference not read. Refs read: ${refs.join(", ") || "none"}` };
      }
      case "completed": {
        const ok = snapshot.events > 0;
        return { text: assertion.text, passed: ok, evidence: ok ? `Completed with ${snapshot.events} events in ${(snapshot.durationMs / 1000).toFixed(1)}s` : "No events recorded" };
      }
      case "custom": {
        return { text: assertion.text, passed: false, evidence: "Custom assertion requires manual review" };
      }
      default:
        return { text: assertion.text, passed: false, evidence: "Unknown assertion type" };
    }
  });

  const passed = results.filter((r) => r.passed).length;
  return {
    expectations: results,
    summary: { passed, failed: results.length - passed, total: results.length, pass_rate: results.length > 0 ? passed / results.length : 0 },
  };
}

function loadAssertions(experimentsDir: string, experimentName: string): AssertionsConfig | null {
  const path = join(experimentsDir, "results", experimentName, "assertions.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function autoGenerateAssertions(report: ExperimentReport): AssertionsConfig {
  const allSignals = Object.keys(report.signalMap);
  const config: AssertionsConfig = {
    default_assertions: [{ text: "Prompt completed successfully", type: "completed" }],
    prompts: {},
  };

  for (const prompt of report.prompts) {
    const assertions: Assertion[] = [];
    const controlSignals = prompt.control?.signals ?? [];
    const treatmentSignals = prompt.treatment?.signals ?? [];
    const allPresent = [...new Set([...controlSignals, ...treatmentSignals])];

    for (const sig of allPresent) {
      assertions.push({ text: `Signal "${sig}" present (proves ${report.signalMap[sig]?.proves ?? "unknown"})`, type: "signal_present", signal: sig });
    }

    const absentSignals = allSignals.filter((s) => !allPresent.includes(s));
    if (absentSignals.length > 0 && allPresent.length === 0) {
      for (const sig of absentSignals.slice(0, 3)) {
        assertions.push({ text: `Signal "${sig}" correctly absent (no leakage)`, type: "signal_absent", signal: sig });
      }
    }

    config.prompts[String(prompt.number)] = { assertions };
  }

  return config;
}

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");
const args = process.argv.slice(2);
const experimentName = args[0];
const dateArg = args[1];

if (!experimentName) {
  console.error("Usage: npx tsx grade-experiment.ts <experiment-name> [date]");
  process.exit(1);
}

const expDir = join(experimentsDir, "results", experimentName);
const reportFiles = readdirSync(expDir).filter((f) => f.endsWith(".json") && f.includes(experimentName));
const reportFile = dateArg
  ? reportFiles.find((f) => f.includes(dateArg))
  : reportFiles.sort().pop();

if (!reportFile) {
  console.error(`No report JSON found in ${expDir}`);
  process.exit(1);
}

const report: ExperimentReport = JSON.parse(readFileSync(join(expDir, reportFile), "utf-8"));
const assertionsConfig = loadAssertions(experimentsDir, experimentName) ?? autoGenerateAssertions(report);

const gradingDir = join(expDir, "grading");
mkdirSync(gradingDir, { recursive: true });

const allGradings: Array<{
  prompt_number: number;
  prompt_text: string;
  control: GradingResult;
  treatment: GradingResult;
}> = [];

for (const prompt of report.prompts) {
  const promptAssertions = [
    ...assertionsConfig.default_assertions,
    ...(assertionsConfig.prompts[String(prompt.number)]?.assertions ?? []),
  ];

  const controlGrading = gradeSnapshot(prompt.control, promptAssertions);
  const treatmentGrading = gradeSnapshot(prompt.treatment, promptAssertions);

  allGradings.push({
    prompt_number: prompt.number,
    prompt_text: prompt.text,
    control: controlGrading,
    treatment: treatmentGrading,
  });

  const promptGradingPath = join(gradingDir, `prompt-${prompt.number}.json`);
  writeFileSync(promptGradingPath, JSON.stringify({ prompt_number: prompt.number, prompt_text: prompt.text, control: controlGrading, treatment: treatmentGrading }, null, 2));
}

const summaryPath = join(gradingDir, "grading-summary.json");
const controlTotal = allGradings.reduce((sum, g) => sum + g.control.summary.passed, 0);
const controlCount = allGradings.reduce((sum, g) => sum + g.control.summary.total, 0);
const treatmentTotal = allGradings.reduce((sum, g) => sum + g.treatment.summary.passed, 0);
const treatmentCount = allGradings.reduce((sum, g) => sum + g.treatment.summary.total, 0);

const summary = {
  experiment: experimentName,
  date: report.date,
  prompts_graded: allGradings.length,
  control: { passed: controlTotal, total: controlCount, pass_rate: controlCount > 0 ? controlTotal / controlCount : 0 },
  treatment: { passed: treatmentTotal, total: treatmentCount, pass_rate: treatmentCount > 0 ? treatmentTotal / treatmentCount : 0 },
  delta_pass_rate: (treatmentCount > 0 ? treatmentTotal / treatmentCount : 0) - (controlCount > 0 ? controlTotal / controlCount : 0),
};

writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

console.log(`Grading complete: ${gradingDir}`);
console.log(`  Control:   ${controlTotal}/${controlCount} (${(summary.control.pass_rate * 100).toFixed(1)}%)`);
console.log(`  Treatment: ${treatmentTotal}/${treatmentCount} (${(summary.treatment.pass_rate * 100).toFixed(1)}%)`);
console.log(`  Delta:     ${summary.delta_pass_rate > 0 ? "+" : ""}${(summary.delta_pass_rate * 100).toFixed(1)}%`);
