"use client";
import { useState } from "react";
import type { PromptResult, SideSnapshot, PromptGrading } from "@/types/report";

function isFailed(side: SideSnapshot | null): boolean {
  return !side || (side.events === 0 && side.durationMs === 0);
}

export function PromptCard({ prompt }: { prompt: PromptResult }) {
  const { control: c, treatment: t } = prompt;
  const cFailed = isFailed(c);
  const tFailed = isFailed(t);

  return (
    <div className={`rounded-lg border p-5 space-y-4 ${cFailed || tFailed ? "border-red-900/40" : "border-zinc-800"}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-medium">
          <span className="text-zinc-500">#{prompt.number}</span>{" "}
          {prompt.text}
        </h3>
        {(cFailed || tFailed) && (
          <span className="shrink-0 rounded-full bg-red-900/30 px-2 py-0.5 text-xs text-red-400">
            {cFailed && tFailed ? "both timed out" : cFailed ? "control timed out" : "treatment timed out"}
          </span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 text-left text-xs uppercase tracking-wider text-zinc-500">
              <th className="pb-2 pr-4">Metric</th>
              <th className="pb-2 pr-4">Control</th>
              <th className="pb-2 pr-4">Treatment</th>
              <th className="pb-2">Match</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs">
            <MetricRow
              label="Events"
              a={cFailed ? "timed out" : c?.events ?? 0}
              b={tFailed ? "timed out" : t?.events ?? 0}
            />
            <MetricRow
              label="Duration"
              a={cFailed ? "---" : formatMs(c?.durationMs ?? 0)}
              b={tFailed ? "---" : formatMs(t?.durationMs ?? 0)}
            />
            <MetricRow
              label="Skills"
              a={cFailed ? "---" : (c?.skillsLoaded.join(", ") || "none")}
              b={tFailed ? "---" : (t?.skillsLoaded.join(", ") || "none")}
            />
            <MetricRow
              label="Refs"
              a={cFailed ? "---" : formatRefs(c)}
              b={tFailed ? "---" : formatRefs(t)}
            />
            <MetricRow
              label="Tools"
              a={cFailed ? "---" : formatTools(c)}
              b={tFailed ? "---" : formatTools(t)}
            />
            <MetricRow
              label="Signals"
              a={cFailed ? "---" : (c?.signals.length ?? 0)}
              b={tFailed ? "---" : (t?.signals.length ?? 0)}
            />
          </tbody>
        </table>
      </div>

      {(c?.signals.length || t?.signals.length) ? (
        <div className="flex gap-6 text-xs">
          {c?.signals.length ? (
            <div>
              <span className="text-zinc-500">Control signals: </span>
              <span className="font-mono text-zinc-400">
                {c.signals.join(", ")}
              </span>
            </div>
          ) : null}
          {t?.signals.length ? (
            <div>
              <span className="text-zinc-500">Treatment signals: </span>
              <span className="font-mono text-zinc-400">
                {t.signals.join(", ")}
              </span>
            </div>
          ) : null}
        </div>
      ) : null}

      {prompt.grading && <GradingDetails grading={prompt.grading} />}
    </div>
  );
}

function GradingDetails({ grading }: { grading: PromptGrading }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-zinc-800/50 pt-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <span className="font-mono">{expanded ? "v" : ">"}</span>
        Grading: {formatGradingSide(grading.control)} control, {formatGradingSide(grading.treatment)} treatment
      </button>

      {expanded && (
        <div className="mt-3 grid grid-cols-2 gap-4">
          <ExpectationList label="Control" side={grading.control} />
          <ExpectationList label="Treatment" side={grading.treatment} />
        </div>
      )}
    </div>
  );
}

function ExpectationList({ label, side }: { label: string; side: PromptGrading["control"] }) {
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      {side.expectations.map((e, i) => (
        <div key={i} className="flex gap-2 text-xs">
          <span className={e.passed ? "text-emerald-400" : "text-red-400"}>
            {e.passed ? "PASS" : "FAIL"}
          </span>
          <div>
            <p className="text-zinc-300">{e.text}</p>
            <p className="text-zinc-600">{e.evidence}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function MetricRow({
  label,
  a,
  b,
}: {
  label: string;
  a: string | number;
  b: string | number;
}) {
  const aTimeout = a === "timed out" || a === "---";
  const bTimeout = b === "timed out" || b === "---";
  const match = !aTimeout && !bTimeout && String(a) === String(b);
  const mismatch = !aTimeout && !bTimeout && String(a) !== String(b);
  return (
    <tr className="border-b border-zinc-800/50">
      <td className="py-1.5 pr-4 font-sans text-zinc-400">{label}</td>
      <td className={`py-1.5 pr-4 ${aTimeout ? "text-red-400/60 italic" : ""}`}>{a}</td>
      <td className={`py-1.5 pr-4 ${bTimeout ? "text-red-400/60 italic" : ""}`}>{b}</td>
      <td className="py-1.5">
        {(aTimeout || bTimeout) ? (
          <span className="text-zinc-600">---</span>
        ) : (
          <span className={match ? "text-emerald-400" : "text-amber-400"}>
            {match ? "=" : "\u2260"}
          </span>
        )}
      </td>
    </tr>
  );
}

function isGradingTimeout(side: PromptGrading["control"]): boolean {
  return side.summary.total > 0 && side.expectations.every(e => e.evidence?.includes("No data") || e.evidence?.includes("run failed"));
}

function formatGradingSide(side: PromptGrading["control"]): string {
  if (isGradingTimeout(side)) return "timed out";
  return `${side.summary.passed}/${side.summary.total}`;
}

function formatMs(ms: number): string {
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatRefs(side: SideSnapshot | null): string {
  if (!side) return "none";
  const entries = Object.entries(side.subskillReads);
  if (entries.length === 0) return "none";
  return entries.map(([s, r]) => `${s}/${r.join(",")}`).join("; ");
}

function formatTools(side: SideSnapshot | null): string {
  if (!side) return "none";
  return (
    Object.entries(side.toolCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([t, c]) => `${t}(${c})`)
      .join(", ") || "none"
  );
}
