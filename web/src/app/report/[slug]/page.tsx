import { notFound } from "next/navigation";
import Link from "next/link";
import { getReport, getReportSlugs } from "@/lib/reports";
import { PromptCard } from "./prompt-card";
import { SignalTable } from "./signal-table";
import { GradingSection } from "./grading-section";

function formatInsight(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-zinc-100">$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="rounded bg-zinc-800 px-1 py-0.5 font-mono text-xs text-amber-300">$1</code>');
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getReportSlugs().map((slug) => ({ slug }));
}

export default async function ReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const report = getReport(slug);
  if (!report) notFound();

  const { summary } = report;
  const isEquivalent = summary.conclusion === "equivalent";

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          &larr; All experiments
        </Link>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">
            {report.experiment.name ?? "Unnamed"}
          </h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isEquivalent
                ? "bg-zinc-800 text-zinc-400"
                : "bg-amber-900/40 text-amber-400"
            }`}
          >
            {isEquivalent ? "equivalent" : "differences detected"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span>{report.date}</span>
          {report.experiment.cliVersion && (
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-zinc-400">
              {report.experiment.cliVersion}
            </span>
          )}
          {report.experiment.source && (
            <a
              href={report.experiment.source}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Source article
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Control
          </p>
          <p className="mt-1 text-sm">{report.experiment.control}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Treatment
          </p>
          <p className="mt-1 text-sm">{report.experiment.treatment}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MatchBadge label="Skills" rate={summary.skillMatchRate} />
        <MatchBadge label="Refs" rate={summary.refMatchRate} />
        <MatchBadge label="Tools" rate={summary.toolMatchRate} />
        <MatchBadge label="Signals" rate={summary.signalMatchRate} />
      </div>

      {report.gradingSummary && (
        <GradingSection summary={report.gradingSummary} />
      )}

      {report.experiment.insights && report.experiment.insights.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Insights</h2>
          <div className="space-y-2">
            {report.experiment.insights.map((insight, i) => (
              <div
                key={i}
                className="rounded-lg border-l-2 border-amber-500/60 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatInsight(insight) }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Per-Prompt Results</h2>
        {report.prompts.map((p) => (
          <PromptCard key={p.number} prompt={p} />
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Totals</h2>
        <div className="grid grid-cols-2 gap-4">
          <TotalsCard label="Control" side={report.totals.control} />
          <TotalsCard label="Treatment" side={report.totals.treatment} />
        </div>
      </div>

      <SignalTable signalMap={report.signalMap} />

      <div className="rounded-lg border border-zinc-800 p-5">
        <h2 className="text-lg font-medium">Conclusion</h2>
        <p className="mt-2 text-sm text-zinc-400">{summary.details}</p>
      </div>
    </div>
  );
}

function MatchBadge({ label, rate }: { label: string; rate: string }) {
  const [num, den] = rate.split("/").map(Number);
  const pct = den > 0 ? num / den : 0;
  const color =
    pct === 1
      ? "text-emerald-400"
      : pct >= 0.5
        ? "text-amber-400"
        : "text-red-400";

  return (
    <div className="rounded-lg border border-zinc-800 p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-xl font-semibold tabular-nums ${color}`}>
        {rate}
      </p>
    </div>
  );
}

function TotalsCard({
  label,
  side,
}: {
  label: string;
  side: {
    sessions: number;
    prompts: number;
    events: number;
    skillsLoaded: string[];
    toolCounts: Record<string, number>;
  };
}) {
  return (
    <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-zinc-500">Sessions</span>
          <p className="font-medium tabular-nums">{side.sessions}</p>
        </div>
        <div>
          <span className="text-zinc-500">Prompts</span>
          <p className="font-medium tabular-nums">{side.prompts}</p>
        </div>
        <div>
          <span className="text-zinc-500">Events</span>
          <p className="font-medium tabular-nums">{side.events}</p>
        </div>
      </div>
      <div className="text-sm">
        <span className="text-zinc-500">Skills: </span>
        <span className="font-mono text-xs">
          {side.skillsLoaded.join(", ") || "none"}
        </span>
      </div>
      <div className="text-sm">
        <span className="text-zinc-500">Tools: </span>
        <span className="font-mono text-xs">
          {Object.entries(side.toolCounts)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([t, c]) => `${t}(${c})`)
            .join(", ") || "none"}
        </span>
      </div>
    </div>
  );
}
