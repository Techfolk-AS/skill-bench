import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

interface EventEntry {
  timestamp: string;
  event: string;
  session_id: string;
  tool: string;
  summary: string;
  details?: Record<string, unknown>;
}

interface SessionSnapshot {
  skillsLoaded: string[];
  subskillReads: Record<string, string[]>;
  referencesRead: string[];
  toolCounts: Record<string, number>;
  totalEvents: number;
  durationMs: number;
}

interface VerificationSignals {
  "data-rack": boolean;
  "--seam": boolean;
  "data-zap": boolean;
  "--pulse": boolean;
  "data-coat": boolean;
  "--ink-": boolean;
  ".plate-": boolean;
  "data-forge-id": boolean;
  "flux-pod": boolean;
  "forge-trigger": boolean;
  "data-hatch-id": boolean;
  "hatch-trigger": boolean;
  "hatch-body": boolean;
  "data-slab-id": boolean;
  "data-rankable": boolean;
  "row-lever": boolean;
  "slab-hollow": boolean;
  "zap()": boolean;
  on_x_y: boolean;
  "createVault()": boolean;
  "linkVault(": boolean;
  "vault.tap(": boolean;
  "skyFetch()": boolean;
  "/sky/": boolean;
  "_landed": boolean;
  "_crashed": boolean;
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

interface TotalsSide {
  sessions: number;
  prompts: number;
  events: number;
  skillsLoaded: string[];
  toolCounts: Record<string, number>;
  subskillReads: Record<string, string[]>;
  signals: string[];
}

interface SummaryResult {
  skillMatchRate: string;
  refMatchRate: string;
  toolMatchRate: string;
  signalMatchRate: string;
  conclusion: "equivalent" | "differences_detected";
  details: string;
}

interface ExperimentReport {
  version: number;
  date: string;
  experiment: {
    name: string | null;
    control: string;
    treatment: string;
    insights: string[];
    cliVersion?: string;
    source?: string;
  };
  prompts: PromptResult[];
  totals: {
    control: TotalsSide;
    treatment: TotalsSide;
  };
  signalMap: Record<string, { control: boolean; treatment: boolean; proves: string }>;
  summary: SummaryResult;
}

const signalProves: Record<string, string> = {
  "data-rack": "CSS layout-patterns",
  "--seam": "CSS layout-patterns",
  "data-zap": "CSS animation-patterns",
  "--pulse": "CSS animation-patterns",
  "data-coat": "CSS theming",
  "--ink-": "CSS theming",
  ".plate-": "CSS theming",
  "data-forge-id": "HTML form-patterns",
  "flux-pod": "HTML form-patterns",
  "forge-trigger": "HTML form-patterns",
  "data-hatch-id": "HTML dialog-patterns",
  "hatch-trigger": "HTML dialog-patterns",
  "hatch-body": "HTML dialog-patterns",
  "data-slab-id": "HTML table-patterns",
  "data-rankable": "HTML table-patterns",
  "row-lever": "HTML table-patterns",
  "slab-hollow": "HTML table-patterns",
  "zap()": "JS event-handling",
  "on_x_y": "JS event-handling",
  "createVault()": "JS state-management",
  "linkVault(": "JS state-management",
  "vault.tap(": "JS state-management",
  "skyFetch()": "JS fetch-patterns",
  "/sky/": "JS fetch-patterns",
  "_landed": "JS fetch-patterns",
  "_crashed": "JS fetch-patterns",
};

function parseEvents(filePath: string): Map<string, EventEntry[]> {
  if (!existsSync(filePath)) return new Map();
  const lines = readFileSync(filePath, "utf-8").trim().split("\n").filter(Boolean);
  const events = lines.map((l) => JSON.parse(l) as EventEntry);

  const sessions = new Map<string, EventEntry[]>();
  for (const e of events) {
    const arr = sessions.get(e.session_id) ?? [];
    arr.push(e);
    sessions.set(e.session_id, arr);
  }
  return sessions;
}

function extractSubskillRead(filePath: string): { skill: string; ref: string } | null {
  const match = filePath.match(/\/skills\/([^/]+)\/references\/(.+)$/);
  if (!match) return null;
  return { skill: match[1], ref: match[2] };
}

function snapshotSession(events: EventEntry[]): SessionSnapshot {
  const preEvents = events.filter((e) => e.event === "PreToolUse");

  const skillsLoaded = [
    ...new Set(
      preEvents
        .filter((e) => e.tool === "Skill")
        .map((e) => (e.details as Record<string, string>)?.skill)
        .filter(Boolean)
    ),
  ];

  const subskillReads: Record<string, string[]> = {};
  const referencesRead: string[] = [];

  for (const e of preEvents.filter((ev) => ev.tool === "Read")) {
    const fp = (e.details as Record<string, string>)?.file_path ?? "";
    const sub = extractSubskillRead(fp);
    if (sub) {
      if (!subskillReads[sub.skill]) subskillReads[sub.skill] = [];
      if (!subskillReads[sub.skill].includes(sub.ref)) {
        subskillReads[sub.skill].push(sub.ref);
      }
      const label = `${sub.skill}/${sub.ref}`;
      if (!referencesRead.includes(label)) referencesRead.push(label);
    }
  }

  const toolCounts: Record<string, number> = {};
  for (const e of preEvents) {
    toolCounts[e.tool] = (toolCounts[e.tool] ?? 0) + 1;
  }

  const timestamps = events.map((e) => new Date(e.timestamp).getTime());
  const durationMs =
    timestamps.length > 1
      ? Math.max(...timestamps) - Math.min(...timestamps)
      : 0;

  return {
    skillsLoaded,
    subskillReads,
    referencesRead,
    toolCounts,
    totalEvents: events.length,
    durationMs,
  };
}

function scanOutputForSignals(
  projectDir: string
): Partial<VerificationSignals> {
  const signals: Partial<VerificationSignals> = {};
  const outputFiles: string[] = [];

  try {
    const entries = readdirSync(projectDir, { recursive: true, withFileTypes: true }) as any[];
    for (const entry of entries) {
      if (
        entry.isFile() &&
        /\.(html|css|js)$/.test(entry.name) &&
        !entry.name.includes("node_modules")
      ) {
        const fullPath =
          typeof entry.parentPath === "string"
            ? join(entry.parentPath, entry.name)
            : join(entry.path ?? projectDir, entry.name);
        outputFiles.push(fullPath);
      }
    }
  } catch {
    return signals;
  }

  for (const f of outputFiles) {
    try {
      const content = readFileSync(f, "utf-8");
      if (content.includes("data-rack")) signals["data-rack"] = true;
      if (content.includes("--seam")) signals["--seam"] = true;
      if (content.includes("data-zap")) signals["data-zap"] = true;
      if (content.includes("--pulse")) signals["--pulse"] = true;
      if (content.includes("data-coat")) signals["data-coat"] = true;
      if (content.includes("--ink-")) signals["--ink-"] = true;
      if (content.includes("plate-")) signals[".plate-"] = true;
      if (content.includes("data-forge-id")) signals["data-forge-id"] = true;
      if (content.includes("flux-pod")) signals["flux-pod"] = true;
      if (content.includes("forge-trigger")) signals["forge-trigger"] = true;
      if (content.includes("data-hatch-id")) signals["data-hatch-id"] = true;
      if (content.includes("hatch-trigger")) signals["hatch-trigger"] = true;
      if (content.includes("hatch-body")) signals["hatch-body"] = true;
      if (content.includes("data-slab-id")) signals["data-slab-id"] = true;
      if (content.includes("data-rankable")) signals["data-rankable"] = true;
      if (content.includes("row-lever")) signals["row-lever"] = true;
      if (content.includes("slab-hollow")) signals["slab-hollow"] = true;
      if (content.includes("zap(")) signals["zap()"] = true;
      if (/on_[a-z]+_[a-z]+/.test(content)) signals["on_x_y"] = true;
      if (content.includes("createVault(")) signals["createVault()"] = true;
      if (content.includes("linkVault(")) signals["linkVault("] = true;
      if (content.includes("vault.tap(")) signals["vault.tap("] = true;
      if (content.includes("skyFetch(")) signals["skyFetch()"] = true;
      if (content.includes("/sky/")) signals["/sky/"] = true;
      if (content.includes("_landed")) signals["_landed"] = true;
      if (content.includes("_crashed")) signals["_crashed"] = true;
    } catch {
      continue;
    }
  }

  return signals;
}

interface PromptGroup {
  number: number;
  prompt: string;
  events: EventEntry[];
}

function collectPromptGroups(projectDir: string, date: string): PromptGroup[] {
  const groups: PromptGroup[] = [];
  if (!existsSync(projectDir)) return groups;

  for (const entry of readdirSync(projectDir)) {
    const match = entry.match(/^prompt-(\d+)$/);
    if (!match) continue;
    const promptNum = parseInt(match[1], 10);
    const archiveLog = join(projectDir, entry, "logs", `claude-events-${date}.jsonl`);
    if (!existsSync(archiveLog)) continue;
    const lines = readFileSync(archiveLog, "utf-8").trim().split("\n").filter(Boolean);
    if (lines.length === 0) continue;
    const events = lines.map((l) => JSON.parse(l) as EventEntry);
    const promptEvent = events.find((e) => e.event === "UserPromptSubmit");
    const promptText = promptEvent
      ? ((promptEvent.details as Record<string, string>)?.prompt ?? promptEvent.summary ?? "")
      : `(prompt ${promptNum})`;
    groups.push({ number: promptNum, prompt: promptText, events });
  }

  if (groups.length === 0) {
    const mainLog = join(projectDir, ".claude/logs", `claude-events-${date}.jsonl`);
    if (existsSync(mainLog)) {
      const lines = readFileSync(mainLog, "utf-8").trim().split("\n").filter(Boolean);
      const events = lines.map((l) => JSON.parse(l) as EventEntry);
      let current: { prompt: string; events: EventEntry[] } | null = null;
      let idx = 1;
      for (const e of events) {
        if (e.event === "UserPromptSubmit") {
          if (current) { groups.push({ number: idx++, ...current }); }
          current = { prompt: (e.details as Record<string, string>)?.prompt ?? e.summary ?? "", events: [e] };
        } else if (current) { current.events.push(e); }
      }
      if (current) groups.push({ number: idx, ...current });
    }
  }

  return groups.sort((a, b) => a.number - b.number);
}

function extractExperimentDesc(experimentsDir: string, name: string | null): { control: string; treatment: string; insights: string[]; cliVersion: string } {
  const fallback = { control: "control", treatment: "treatment", insights: [], cliVersion: "" };
  if (!name) return fallback;
  const logPath = join(experimentsDir, "results", name, "log.md");
  if (!existsSync(logPath)) return fallback;
  const content = readFileSync(logPath, "utf-8");
  const implMatch = content.match(/## Implementation\s*\n\s*\n?([\s\S]*?)(?=\n##|\n*$)/);
  const hypMatch = content.match(/## Hypothesis\s*\n\s*\n?([\s\S]*?)(?=\n##)/);
  const insightsMatch = content.match(/## Insights\s*\n\s*\n?([\s\S]*?)(?=\n## )/);
  const cliMatch = content.match(/\*\*CLI:\*\*\s*(.*)/);
  const sourceMatch = content.match(/\*\*Source:\*\*\s*(.*)/);
  const treatment = implMatch?.[1]?.trim().split("\n")[0]?.replace(/^profileB change:\s*/i, "").trim();
  const hypothesis = hypMatch?.[1]?.trim().split("\n")[0]?.trim();
  const insightsRaw = insightsMatch?.[1]?.trim() ?? "";
  const insights = insightsRaw
    .split(/\n(?=\d+\.\s)/)
    .map(s => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  return {
    control: "No changes (baseline)",
    treatment: treatment || hypothesis || "treatment",
    insights,
    cliVersion: cliMatch?.[1]?.trim() ?? "",
    source: sourceMatch?.[1]?.trim() ?? "",
  };
}

function snapToSide(snap: SessionSnapshot | null, signalObj: Partial<VerificationSignals>): SideSnapshot | null {
  if (!snap) return null;
  return {
    events: snap.totalEvents,
    durationMs: snap.durationMs,
    skillsLoaded: snap.skillsLoaded,
    subskillReads: snap.subskillReads,
    toolCounts: snap.toolCounts,
    signals: Object.keys(signalObj).filter((k) => (signalObj as any)[k]),
  };
}

function generateJsonReport(
  date: string,
  aSessionMap: Map<string, EventEntry[]>,
  bSessionMap: Map<string, EventEntry[]>,
  aPromptGroups: PromptGroup[],
  bPromptGroups: PromptGroup[],
  projectsBaseDir: string,
  experimentDesc: { control: string; treatment: string; insights: string[]; cliVersion: string; source: string },
  experimentName: string | null
): ExperimentReport {
  const aAllEvents = [...aSessionMap.values()].flat();
  const bAllEvents = [...bSessionMap.values()].flat();

  const aTotal = snapshotSession(aAllEvents);
  const bTotal = snapshotSession(bAllEvents);

  const aByNum = new Map(aPromptGroups.map((g) => [g.number, g]));
  const bByNum = new Map(bPromptGroups.map((g) => [g.number, g]));
  const promptNumbers = [...new Set([...aByNum.keys(), ...bByNum.keys()])].sort((a, b) => a - b);

  const prompts: PromptResult[] = [];
  const allASignals: Partial<VerificationSignals> = {};
  const allBSignals: Partial<VerificationSignals> = {};

  for (const num of promptNumbers) {
    const aGroup = aByNum.get(num);
    const bGroup = bByNum.get(num);
    const promptText = aGroup?.prompt ?? bGroup?.prompt ?? "unknown";

    const aSnap = aGroup ? snapshotSession(aGroup.events) : null;
    const bSnap = bGroup ? snapshotSession(bGroup.events) : null;

    const aPromptSignals = scanOutputForSignals(join(projectsBaseDir, "ProjectA", `prompt-${num}`));
    const bPromptSignals = scanOutputForSignals(join(projectsBaseDir, "ProjectB", `prompt-${num}`));

    for (const [k, v] of Object.entries(aPromptSignals)) if (v) (allASignals as any)[k] = true;
    for (const [k, v] of Object.entries(bPromptSignals)) if (v) (allBSignals as any)[k] = true;

    prompts.push({
      number: num,
      text: promptText,
      control: snapToSide(aSnap, aPromptSignals),
      treatment: snapToSide(bSnap, bPromptSignals),
    });
  }

  const aRoot = scanOutputForSignals(join(projectsBaseDir, "ProjectA"));
  const bRoot = scanOutputForSignals(join(projectsBaseDir, "ProjectB"));
  for (const [k, v] of Object.entries(aRoot)) if (v) (allASignals as any)[k] = true;
  for (const [k, v] of Object.entries(bRoot)) if (v) (allBSignals as any)[k] = true;

  const signalMap: Record<string, { control: boolean; treatment: boolean; proves: string }> = {};
  for (const [sig, proves] of Object.entries(signalProves)) {
    signalMap[sig] = {
      control: !!(allASignals as any)[sig],
      treatment: !!(allBSignals as any)[sig],
      proves,
    };
  }

  let skillMatchCount = 0;
  let refMatchCount = 0;
  let toolMatchCount = 0;
  const totalPrompts = promptNumbers.length;

  for (const num of promptNumbers) {
    const aGroup = aByNum.get(num);
    const bGroup = bByNum.get(num);
    const aSnap = aGroup ? snapshotSession(aGroup.events) : null;
    const bSnap = bGroup ? snapshotSession(bGroup.events) : null;
    const aSkills = aSnap?.skillsLoaded.join(", ") || "none";
    const bSkills = bSnap?.skillsLoaded.join(", ") || "none";
    if (aSkills === bSkills) skillMatchCount++;
    const aRefs = aSnap ? Object.entries(aSnap.subskillReads).sort(([a], [b]) => a.localeCompare(b)).map(([s, r]) => `${s}:${r.join(",")}`).join(";") : "none";
    const bRefs = bSnap ? Object.entries(bSnap.subskillReads).sort(([a], [b]) => a.localeCompare(b)).map(([s, r]) => `${s}:${r.join(",")}`).join(";") : "none";
    if (aRefs === bRefs) refMatchCount++;
    const aTools = aSnap ? Object.entries(aSnap.toolCounts).sort(([a], [b]) => a.localeCompare(b)).map(([t, c]) => `${t}:${c}`).join(",") : "none";
    const bTools = bSnap ? Object.entries(bSnap.toolCounts).sort(([a], [b]) => a.localeCompare(b)).map(([t, c]) => `${t}:${c}`).join(",") : "none";
    if (aTools === bTools) toolMatchCount++;
  }

  const signalNames = Object.keys(signalProves);
  let signalMatchCount = 0;
  for (const sig of signalNames) {
    if (!!(allASignals as any)[sig] === !!(allBSignals as any)[sig]) signalMatchCount++;
  }

  const allMatch = skillMatchCount === totalPrompts && refMatchCount === totalPrompts && signalMatchCount === signalNames.length;

  let details: string;
  if (allMatch) {
    details = `Equivalent results across all ${totalPrompts} prompts. No measurable benefit from treatment.`;
  } else {
    const diffs: string[] = [];
    if (skillMatchCount < totalPrompts) diffs.push(`skills differed in ${totalPrompts - skillMatchCount}/${totalPrompts} prompts`);
    if (refMatchCount < totalPrompts) diffs.push(`subskill refs differed in ${totalPrompts - refMatchCount}/${totalPrompts} prompts`);
    if (signalMatchCount < signalNames.length) diffs.push(`${signalNames.length - signalMatchCount}/${signalNames.length} verification signals differed`);
    details = diffs.join("; ");
  }

  return {
    version: 1,
    date,
    experiment: {
      name: experimentName,
      control: experimentDesc.control,
      treatment: experimentDesc.treatment,
      insights: experimentDesc.insights,
      cliVersion: experimentDesc.cliVersion,
      source: experimentDesc.source,
    },
    prompts,
    totals: {
      control: {
        sessions: aSessionMap.size,
        prompts: aPromptGroups.length,
        events: aTotal.totalEvents,
        skillsLoaded: aTotal.skillsLoaded,
        toolCounts: aTotal.toolCounts,
        subskillReads: aTotal.subskillReads,
        signals: Object.keys(allASignals).filter((k) => (allASignals as any)[k]),
      },
      treatment: {
        sessions: bSessionMap.size,
        prompts: bPromptGroups.length,
        events: bTotal.totalEvents,
        skillsLoaded: bTotal.skillsLoaded,
        toolCounts: bTotal.toolCounts,
        subskillReads: bTotal.subskillReads,
        signals: Object.keys(allBSignals).filter((k) => (allBSignals as any)[k]),
      },
    },
    signalMap,
    summary: {
      skillMatchRate: `${skillMatchCount}/${totalPrompts}`,
      refMatchRate: `${refMatchCount}/${totalPrompts}`,
      toolMatchRate: `${toolMatchCount}/${totalPrompts}`,
      signalMatchRate: `${signalMatchCount}/${signalNames.length}`,
      conclusion: allMatch ? "equivalent" : "differences_detected",
      details,
    },
  };
}

function findActiveExperiment(experimentsDir: string, date: string): string | null {
  const expDir = join(experimentsDir, "results");
  if (!existsSync(expDir)) return null;
  const candidates: string[] = [];
  for (const name of readdirSync(expDir)) {
    const logPath = join(expDir, name, "log.md");
    if (!existsSync(logPath)) continue;
    const content = readFileSync(logPath, "utf-8");
    const hasDate = content.includes(`**Date:** ${date}`);
    const isTesting = /\*\*Status:\*\*\s*testing/.test(content);
    if (hasDate && isTesting) candidates.push(name);
  }
  return candidates.length === 1 ? candidates[0] : null;
}

function collectEventFiles(projectDir: string, date: string): string[] {
  const promptFiles: string[] = [];
  if (existsSync(projectDir)) {
    for (const entry of readdirSync(projectDir)) {
      if (!entry.startsWith("prompt-")) continue;
      const archiveLog = join(projectDir, entry, "logs", `claude-events-${date}.jsonl`);
      if (existsSync(archiveLog)) promptFiles.push(archiveLog);
    }
  }
  if (promptFiles.length > 0) return promptFiles;
  const mainLog = join(projectDir, ".claude/logs", `claude-events-${date}.jsonl`);
  if (existsSync(mainLog)) return [mainLog];
  return [];
}

function parseAllEvents(projectDir: string, date: string): Map<string, EventEntry[]> {
  const allSessions = new Map<string, EventEntry[]>();
  for (const filePath of collectEventFiles(projectDir, date)) {
    const sessions = parseEvents(filePath);
    for (const [sid, events] of sessions) {
      const existing = allSessions.get(sid) ?? [];
      existing.push(...events);
      allSessions.set(sid, existing);
    }
  }
  return allSessions;
}

const experimentsDir = join(import.meta.dirname!, "../experiments");
const args = process.argv.slice(2);
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));
const nameArg = args.find((a) => !/^\d{4}-\d{2}-\d{2}$/.test(a) && !a.includes("/") && a !== "--md");
const outputMd = args.includes("--md");
const date = dateArg ?? new Date().toISOString().split("T")[0];
const projectsBaseDir = experimentsDir;

const aEvents = parseAllEvents(join(experimentsDir, "ProjectA"), date);
const bEvents = parseAllEvents(join(experimentsDir, "ProjectB"), date);

if (!aEvents.size && !bEvents.size) {
  console.log(
    `No events for ${date}. Usage: npx tsx generate-report.ts [date] [name] [--md]`
  );
  process.exit(1);
}

const aPromptGroups = collectPromptGroups(join(experimentsDir, "ProjectA"), date);
const bPromptGroups = collectPromptGroups(join(experimentsDir, "ProjectB"), date);

const experimentName = nameArg ?? findActiveExperiment(experimentsDir, date);
const experimentDesc = extractExperimentDesc(experimentsDir, experimentName);
const report = generateJsonReport(date, aEvents, bEvents, aPromptGroups, bPromptGroups, projectsBaseDir, experimentDesc, experimentName);

const outDir = experimentName
  ? join(experimentsDir, "results", experimentName)
  : experimentsDir;
mkdirSync(outDir, { recursive: true });

const jsonFilename = experimentName
  ? `${experimentName}-${date}.json`
  : `report-${date}.json`;
const jsonPath = join(outDir, jsonFilename);
writeFileSync(jsonPath, JSON.stringify(report, null, 2));
console.log(`JSON report written to: ${jsonPath}`);

if (outputMd) {
  const mdFilename = experimentName
    ? `${experimentName}-${date}.md`
    : `report-${date}.md`;
  const mdPath = join(outDir, mdFilename);
  const md = renderMarkdown(report);
  writeFileSync(mdPath, md);
  console.log(`Markdown report written to: ${mdPath}`);
}

function renderMarkdown(r: ExperimentReport): string {
  let md = `# A/B Experiment Report — ${r.date}\n\n`;
  md += `**Control**: ${r.experiment.control}\n`;
  md += `**Treatment**: ${r.experiment.treatment}\n\n`;

  for (const p of r.prompts) {
    md += `## Prompt ${p.number}: "${p.text}"\n\n`;
    md += `| Metric | Control | Treatment | Match? |\n`;
    md += `|--------|---------|-----------|--------|\n`;
    const c = p.control;
    const t = p.treatment;
    md += `| Events | ${c?.events ?? 0} | ${t?.events ?? 0} | ${(c?.events ?? 0) === (t?.events ?? 0) ? "=" : "≠"} |\n`;
    md += `| Duration | ${((c?.durationMs ?? 0) / 1000).toFixed(1)}s | ${((t?.durationMs ?? 0) / 1000).toFixed(1)}s | |\n`;
    md += `| Skills | ${c?.skillsLoaded.join(", ") || "none"} | ${t?.skillsLoaded.join(", ") || "none"} | ${JSON.stringify(c?.skillsLoaded) === JSON.stringify(t?.skillsLoaded) ? "=" : "≠"} |\n`;
    md += `| Signals | ${c?.signals.length ?? 0} | ${t?.signals.length ?? 0} | ${(c?.signals.length ?? 0) === (t?.signals.length ?? 0) ? "=" : "≠"} |\n`;
    md += "\n";
  }

  md += `## Summary\n\n`;
  md += `| Dimension | Match rate |\n`;
  md += `|-----------|------------|\n`;
  md += `| Skills | ${r.summary.skillMatchRate} |\n`;
  md += `| Refs | ${r.summary.refMatchRate} |\n`;
  md += `| Tools | ${r.summary.toolMatchRate} |\n`;
  md += `| Signals | ${r.summary.signalMatchRate} |\n\n`;
  md += `**Conclusion**: ${r.summary.conclusion} — ${r.summary.details}\n`;

  return md;
}
