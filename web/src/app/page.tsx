import Link from "next/link";
import { getAllReports } from "@/lib/reports";

function deltaColor(delta: number) {
  if (delta > 0.05) return { border: "border-emerald-800/60", accent: "text-emerald-400", bg: "bg-emerald-900/20", label: "positive" } as const;
  if (delta < -0.05) return { border: "border-red-800/60", accent: "text-red-400", bg: "bg-red-900/20", label: "negative" } as const;
  return { border: "border-zinc-700", accent: "text-zinc-400", bg: "bg-zinc-800/40", label: "neutral" } as const;
}

export default function Home() {
  const reports = getAllReports();

  if (reports.length === 0) {
    return (
      <div className="py-20 text-center text-zinc-500">
        <p className="text-lg">No experiments yet.</p>
        <p className="mt-2 text-sm">
          Add JSON report files to <code className="text-zinc-400">src/data/</code> and redeploy.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Experiments</h1>
        <p className="mt-1 text-sm text-zinc-500">{reports.length} experiments tracked</p>
      </div>
      <div className="grid gap-4">
        {reports.map(({ report: r, slug }) => {
          const delta = r.gradingSummary?.delta_pass_rate ?? 0;
          const color = deltaColor(delta);

          return (
            <Link
              key={slug}
              href={`/report/${slug}`}
              className={`group relative overflow-hidden rounded-lg border ${color.border} p-5 transition-all hover:border-zinc-500 hover:bg-zinc-900/50`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="font-medium group-hover:text-white">
                      {r.experiment.name ?? "Unnamed"}
                    </h2>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${color.bg} ${color.accent}`}>
                      {color.label}
                    </span>
                  </div>
                  <p className="mt-1.5 line-clamp-2 text-sm text-zinc-400">
                    {r.experiment.treatment}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <span className="text-xs text-zinc-500">{r.date}</span>
                  {r.gradingSummary && (
                    <span className={`text-2xl font-semibold tabular-nums ${color.accent}`}>
                      {delta > 0 ? "+" : ""}{(delta * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                <span>{r.prompts.length} prompts</span>
                <span>skills {r.summary.skillMatchRate}</span>
                <span>refs {r.summary.refMatchRate}</span>
                <span>signals {r.summary.signalMatchRate}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
