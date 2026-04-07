import { readdirSync, readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";
import type { ExperimentReport, PromptGrading, GradingSummary } from "@/types/report";

export interface ReportEntry {
  report: ExperimentReport;
  slug: string;
}

const dataDir = join(process.cwd(), "src", "data");

function loadGradingSummary(dir: string): GradingSummary | undefined {
  const path = join(dir, "grading", "grading-summary.json");
  if (!existsSync(path)) return undefined;
  return JSON.parse(readFileSync(path, "utf-8")) as GradingSummary;
}

function loadPromptGradings(dir: string): Map<number, PromptGrading> {
  const gradingDir = join(dir, "grading");
  if (!existsSync(gradingDir)) return new Map();

  const map = new Map<number, PromptGrading>();
  const files = readdirSync(gradingDir).filter((f) => f.match(/^prompt-\d+\.json$/));
  for (const f of files) {
    const grading = JSON.parse(readFileSync(join(gradingDir, f), "utf-8")) as PromptGrading;
    map.set(grading.prompt_number, grading);
  }
  return map;
}

function loadReportFromDir(dir: string): ExperimentReport | null {
  const reportPath = join(dir, "report.json");
  if (!existsSync(reportPath)) return null;

  const report = JSON.parse(readFileSync(reportPath, "utf-8")) as ExperimentReport;
  const gradingSummary = loadGradingSummary(dir);
  const promptGradings = loadPromptGradings(dir);

  if (gradingSummary) report.gradingSummary = gradingSummary;

  for (const prompt of report.prompts) {
    const grading = promptGradings.get(prompt.number);
    if (grading) prompt.grading = grading;
  }

  return report;
}

function legacySlug(report: ExperimentReport): string {
  return `${report.experiment.name ?? "report"}-${report.date}`;
}

export function getAllReports(): ReportEntry[] {
  const entries = readdirSync(dataDir, { withFileTypes: true });
  const results: ReportEntry[] = [];

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const report = loadReportFromDir(join(dataDir, entry.name));
      if (report) results.push({ report, slug: entry.name });
    } else if (entry.isFile() && entry.name.endsWith(".json")) {
      const content = readFileSync(join(dataDir, entry.name), "utf-8");
      const report = JSON.parse(content) as ExperimentReport;
      results.push({ report, slug: legacySlug(report) });
    }
  }

  return results.sort((a, b) => b.report.date.localeCompare(a.report.date));
}

export function getReport(slug: string): ExperimentReport | null {
  const dirPath = join(dataDir, slug);
  if (existsSync(dirPath) && statSync(dirPath).isDirectory()) {
    return loadReportFromDir(dirPath);
  }

  const files = readdirSync(dataDir).filter((f) => f.endsWith(".json"));
  for (const f of files) {
    const content = readFileSync(join(dataDir, f), "utf-8");
    const report = JSON.parse(content) as ExperimentReport;
    if (legacySlug(report) === slug) return report;
  }
  return null;
}

export function getReportSlugs(): string[] {
  return getAllReports().map((e) => e.slug);
}
