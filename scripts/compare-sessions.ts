import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

interface EventEntry {
  timestamp: string;
  event: string;
  session_id: string;
  tool: string;
  summary: string;
  details?: Record<string, unknown>;
}

interface SessionMetrics {
  profile: string;
  sessionId: string;
  totalEvents: number;
  skillsLoaded: string[];
  subskillReads: Record<string, string[]>;
  referencesRead: string[];
  toolCounts: Record<string, number>;
  timelineMs: number;
  firstEventTime: string;
  lastEventTime: string;
}

function parseEventLog(filePath: string): EventEntry[] {
  if (!existsSync(filePath)) return [];
  const lines = readFileSync(filePath, "utf-8").trim().split("\n");
  return lines.filter(Boolean).map((line) => JSON.parse(line));
}

function parseSkillsUsed(logsDir: string): string[] {
  const files = readdirSync(logsDir).filter((f) =>
    f.startsWith("skills-used-")
  );
  const all: string[] = [];
  for (const f of files) {
    const data = JSON.parse(readFileSync(join(logsDir, f), "utf-8"));
    if (data.skillsUsed) all.push(...data.skillsUsed);
  }
  return [...new Set(all)];
}

function extractSubskillRead(filePath: string): { skill: string; ref: string } | null {
  const match = filePath.match(/\/skills\/([^/]+)\/references\/(.+)$/);
  if (!match) return null;
  return { skill: match[1], ref: match[2] };
}

function extractMetrics(
  profile: string,
  events: EventEntry[]
): SessionMetrics {
  const preEvents = events.filter((e) => e.event === "PreToolUse");

  const skillEvents = preEvents.filter((e) => e.tool === "Skill");
  const skillsLoaded = skillEvents
    .map((e) => (e.details as Record<string, string>)?.skill)
    .filter(Boolean);

  const readEvents = preEvents.filter((e) => e.tool === "Read");
  const subskillReads: Record<string, string[]> = {};
  const referencesRead: string[] = [];

  for (const e of readEvents) {
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
  const timelineMs =
    timestamps.length > 1
      ? Math.max(...timestamps) - Math.min(...timestamps)
      : 0;

  return {
    profile,
    sessionId: events[0]?.session_id ?? "unknown",
    totalEvents: events.length,
    skillsLoaded: [...new Set(skillsLoaded)],
    subskillReads,
    referencesRead,
    toolCounts,
    timelineMs,
    firstEventTime: events[0]?.timestamp ?? "",
    lastEventTime: events[events.length - 1]?.timestamp ?? "",
  };
}

function extractPrompts(events: EventEntry[]): string[] {
  return events
    .filter((e) => e.event === "UserPromptSubmit")
    .map((e) => (e.details as Record<string, string>)?.prompt ?? e.summary ?? "")
    .filter(Boolean);
}

function printComparison(a: SessionMetrics, b: SessionMetrics, aEvents: EventEntry[], bEvents: EventEntry[]) {
  const line = (label: string, va: string | number, vb: string | number) => {
    const match = va === vb || JSON.stringify(va) === JSON.stringify(vb);
    const marker = match ? "  " : "≠ ";
    console.log(`${marker}${label.padEnd(22)} ${String(va).padEnd(35)} ${vb}`);
  };

  console.log("\n╔══════════════════════════════════════════════════════════════════╗");
  console.log("║              A/B SESSION COMPARISON                              ║");
  console.log("╚══════════════════════════════════════════════════════════════════╝\n");

  const aPrompts = extractPrompts(aEvents);
  const bPrompts = extractPrompts(bEvents);
  const prompts = aPrompts.length >= bPrompts.length ? aPrompts : bPrompts;
  if (prompts.length > 0) {
    console.log(`  Prompts:`);
    for (const p of prompts) {
      console.log(`    "${p}"`);
    }
    console.log();
  }

  console.log(`  ${"".padEnd(22)} ${"profileA (control)".padEnd(35)} profileB (treatment)`);
  console.log(`  ${"─".repeat(22)} ${"─".repeat(35)} ${"─".repeat(30)}`);

  line("Session ID", a.sessionId.slice(0, 8), b.sessionId.slice(0, 8));
  line("Total events", a.totalEvents, b.totalEvents);
  line(
    "Duration (s)",
    (a.timelineMs / 1000).toFixed(1),
    (b.timelineMs / 1000).toFixed(1)
  );
  line(
    "Skills loaded",
    a.skillsLoaded.join(", ") || "none",
    b.skillsLoaded.join(", ") || "none"
  );

  console.log(`\n  Subskill reads (skill→[references]):`);
  const allSkills = [
    ...new Set([
      ...Object.keys(a.subskillReads),
      ...Object.keys(b.subskillReads),
    ]),
  ].sort();

  if (allSkills.length === 0) {
    console.log("    (none)");
  } else {
    for (const skill of allSkills) {
      const aRefs = a.subskillReads[skill]?.join(", ") ?? "—";
      const bRefs = b.subskillReads[skill]?.join(", ") ?? "—";
      const match = aRefs === bRefs;
      const marker = match ? "  " : "≠ ";
      console.log(`${marker}  ${skill.padEnd(20)} ${aRefs.padEnd(35)} ${bRefs}`);
    }
  }

  console.log(`\n  Tool usage breakdown:`);
  const allTools = [
    ...new Set([
      ...Object.keys(a.toolCounts),
      ...Object.keys(b.toolCounts),
    ]),
  ].sort();
  for (const tool of allTools) {
    line(`  ${tool}`, a.toolCounts[tool] ?? 0, b.toolCounts[tool] ?? 0);
  }

  console.log("\n  Key differences:");
  const aOnlySkills = a.skillsLoaded.filter(
    (s) => !b.skillsLoaded.includes(s)
  );
  const bOnlySkills = b.skillsLoaded.filter(
    (s) => !a.skillsLoaded.includes(s)
  );
  const aOnlyRefs = a.referencesRead.filter(
    (r) => !b.referencesRead.includes(r)
  );
  const bOnlyRefs = b.referencesRead.filter(
    (r) => !a.referencesRead.includes(r)
  );

  if (aOnlySkills.length)
    console.log(`  → A-only skills: ${aOnlySkills.join(", ")}`);
  if (bOnlySkills.length)
    console.log(`  → B-only skills: ${bOnlySkills.join(", ")}`);
  if (aOnlyRefs.length)
    console.log(`  → A-only subskill refs: ${aOnlyRefs.join(", ")}`);
  if (bOnlyRefs.length)
    console.log(`  → B-only subskill refs: ${bOnlyRefs.join(", ")}`);
  if (
    !aOnlySkills.length &&
    !bOnlySkills.length &&
    !aOnlyRefs.length &&
    !bOnlyRefs.length
  ) {
    console.log("  → Same skills and subskill references loaded");
  }
}

const experimentsDir = join(import.meta.dirname!, "../experiments");
const date =
  process.argv[2] ?? new Date().toISOString().split("T")[0];

const aLogs = join(experimentsDir, "ProjectA/.claude/logs");
const bLogs = join(experimentsDir, "ProjectB/.claude/logs");

function collectAllEvents(projectDir: string, logsDir: string, date: string): EventEntry[] {
  const events: EventEntry[] = [];
  const mainLog = join(logsDir, `claude-events-${date}.jsonl`);
  if (existsSync(mainLog)) events.push(...parseEventLog(mainLog));
  if (existsSync(projectDir)) {
    for (const entry of readdirSync(projectDir)) {
      if (!entry.startsWith("prompt-")) continue;
      const archiveLog = join(projectDir, entry, "logs", `claude-events-${date}.jsonl`);
      if (existsSync(archiveLog)) events.push(...parseEventLog(archiveLog));
    }
  }
  return events;
}

const aEvents = collectAllEvents(join(experimentsDir, "ProjectA"), aLogs, date);
const bEvents = collectAllEvents(join(experimentsDir, "ProjectB"), bLogs, date);

if (!aEvents.length && !bEvents.length) {
  console.log(`No events found for ${date}. Pass a date: npx tsx compare-sessions.ts 2026-02-19`);
  process.exit(1);
}

const aMetrics = extractMetrics("profileA", aEvents);
const bMetrics = extractMetrics("profileB", bEvents);

aMetrics.skillsLoaded =
  aMetrics.skillsLoaded.length > 0
    ? aMetrics.skillsLoaded
    : parseSkillsUsed(aLogs);
bMetrics.skillsLoaded =
  bMetrics.skillsLoaded.length > 0
    ? bMetrics.skillsLoaded
    : parseSkillsUsed(bLogs);

printComparison(aMetrics, bMetrics, aEvents, bEvents);
