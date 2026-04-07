import type { GradingSummary } from "@/types/report";

export function GradingSection({ summary }: { summary: GradingSummary }) {
  const delta = summary.delta_pass_rate;
  const deltaColor = delta > 0 ? "text-emerald-400" : delta < 0 ? "text-red-400" : "text-zinc-400";
  const deltaSign = delta > 0 ? "+" : "";

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium">Grading</h2>
      <div className="grid grid-cols-3 gap-4">
        <PassRateCard label="Control" rate={summary.control.pass_rate} detail={`${summary.control.passed}/${summary.control.total}`} />
        <PassRateCard label="Treatment" rate={summary.treatment.pass_rate} detail={`${summary.treatment.passed}/${summary.treatment.total}`} />
        <div className="rounded-lg border border-zinc-800 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">Delta</p>
          <p className={`mt-1 text-xl font-semibold tabular-nums ${deltaColor}`}>
            {deltaSign}{(delta * 100).toFixed(1)}%
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">{summary.prompts_graded} prompts graded</p>
        </div>
      </div>
    </div>
  );
}

function PassRateCard({ label, rate, detail }: { label: string; rate: number; detail: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 p-4 text-center">
      <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{(rate * 100).toFixed(1)}%</p>
      <p className="mt-0.5 text-xs text-zinc-600">{detail}</p>
    </div>
  );
}
