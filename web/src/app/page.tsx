import Link from "next/link";
import { getAllReports } from "@/lib/reports";

function deltaColor(delta: number) {
  if (delta > 0.05) return { border: "border-emerald-800/60", accent: "text-emerald-400", bg: "bg-emerald-900/20", label: "positive" } as const;
  if (delta < -0.05) return { border: "border-red-800/60", accent: "text-red-400", bg: "bg-red-900/20", label: "negative" } as const;
  return { border: "border-zinc-700", accent: "text-zinc-400", bg: "bg-zinc-800/40", label: "neutral" } as const;
}

function ExperimentCard({ report: r, slug }: { report: ReturnType<typeof getAllReports>[number]["report"]; slug: string }) {
  const delta = r.gradingSummary?.delta_pass_rate ?? 0;
  const color = deltaColor(delta);

  return (
    <Link
      href={`/report/${slug}`}
      className={`group relative overflow-hidden rounded-lg border ${color.border} p-5 transition-all hover:border-zinc-500 hover:bg-zinc-900/50`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h3 className="font-medium group-hover:text-white">
              {r.experiment.name ?? "Unnamed"}
            </h3>
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
}

function HeroSection() {
  return (
    <section className="hero-section relative overflow-hidden py-24 sm:py-32">
      <div className="hero-glow" />
      <div className="hero-grid" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-900/80 px-4 py-1.5 text-sm text-zinc-400 backdrop-blur-sm">
          <span className="pulse-dot" />
          Open source A/B testing for AI coding agents
        </div>
        <h1 className="hero-title text-4xl font-bold tracking-tight sm:text-6xl">
          Does your skill config<br />
          <span className="gradient-text">actually work?</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          SkillBench is an experimentation framework that measures whether changes to
          Claude Code skills, hooks, and configurations produce real behavioral differences,
          or just feel like they should.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a href="#experiments" className="rounded-lg bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 transition-all hover:bg-zinc-200">
            View experiments
          </a>
          <a
            href="https://github.com/Techfolk-AS/skill-bench"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-zinc-700 px-5 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:border-zinc-500 hover:text-white"
          >
            GitHub repo
          </a>
        </div>
      </div>
    </section>
  );
}

function WhatSection() {
  return (
    <section className="border-t border-zinc-800/50 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">What is this?</h2>
        <p className="mt-4 leading-relaxed text-zinc-400">
          Claude Code supports <strong className="text-zinc-200">skills</strong> (reusable instruction files),{" "}
          <strong className="text-zinc-200">hooks</strong> (lifecycle event handlers), and{" "}
          <strong className="text-zinc-200">commands</strong> (slash-invocable workflows).
          But when you tweak a skill description, rename a reference file, or add a hook,
          how do you know if it actually changes Claude&apos;s behavior?
        </p>
        <p className="mt-4 leading-relaxed text-zinc-400">
          SkillBench answers that by running the same prompts against two configurations
          (control vs. treatment) in isolated Docker containers, then comparing what skills
          were loaded, which references were read, and whether the outputs contain
          expected verification signals.
        </p>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Hypothesis",
      description: "Start with a claim or idea. \"Keyword-dense descriptions improve skill activation.\" \"Adding a TOC to reference files helps Claude find the right section.\"",
    },
    {
      number: "02",
      title: "Template + Treatment",
      description: "A template project with test skills (CSS, HTML, JavaScript) gets copied into ProjectA (control) and ProjectB (treatment). The treatment applies the change being tested.",
    },
    {
      number: "03",
      title: "Isolated execution",
      description: "Each prompt runs inside a fresh Docker container with the ANTHROPIC_API_KEY injected. No conversation context bleeds between prompts. Event hooks log every skill load, reference read, and tool call.",
    },
    {
      number: "04",
      title: "Signal detection",
      description: "The template skills embed unique verification signals (data attributes, CSS custom properties, function names) in their references. If Claude read the right reference, those signals appear in the output.",
    },
    {
      number: "05",
      title: "Grading + Report",
      description: "Automated grading checks each prompt's output against assertions (signal present/absent, skill triggered, reference read). Results are aggregated into pass rates, deltas, and statistical benchmarks.",
    },
  ];

  return (
    <section className="border-t border-zinc-800/50 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <p className="mt-4 mb-10 text-zinc-400">
          Each experiment follows a five-step pipeline, fully automated via{" "}
          <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-zinc-300">/experiment:test</code>
        </p>
        <div className="space-y-0">
          {steps.map((step) => (
            <div key={step.number} className="step-card group relative border-l border-zinc-800 py-6 pl-8">
              <div className="step-dot absolute -left-[5px] top-8 h-2.5 w-2.5 rounded-full border-2 border-zinc-700 bg-zinc-900 transition-colors group-hover:border-zinc-400" />
              <div className="flex items-baseline gap-3">
                <span className="font-mono text-xs text-zinc-600">{step.number}</span>
                <h3 className="font-medium text-zinc-200">{step.title}</h3>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-400 transition-colors">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SignalsSection() {
  const signalGroups = [
    {
      skill: "CSS",
      signals: [
        { name: "data-rack", reference: "layout-patterns" },
        { name: "--seam", reference: "layout-patterns" },
        { name: "data-zap", reference: "animation-patterns" },
        { name: "--pulse", reference: "animation-patterns" },
        { name: "data-coat", reference: "theming" },
        { name: "--ink-*", reference: "theming" },
      ],
    },
    {
      skill: "HTML",
      signals: [
        { name: "data-forge-id", reference: "form-patterns" },
        { name: "forge-trigger", reference: "form-patterns" },
        { name: "data-hatch-id", reference: "dialog-patterns" },
        { name: "hatch-trigger", reference: "dialog-patterns" },
        { name: "data-slab-id", reference: "table-patterns" },
        { name: "row-lever", reference: "table-patterns" },
      ],
    },
    {
      skill: "JavaScript",
      signals: [
        { name: "zap()", reference: "event-handling" },
        { name: "on_x_y", reference: "event-handling" },
        { name: "createVault()", reference: "state-management" },
        { name: "vault.tap()", reference: "state-management" },
        { name: "skyFetch()", reference: "fetch-patterns" },
        { name: "_landed", reference: "fetch-patterns" },
      ],
    },
  ];

  return (
    <section className="border-t border-zinc-800/50 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Verification signals</h2>
        <p className="mt-4 mb-8 text-zinc-400">
          Each reference file embeds unique naming conventions that would never appear naturally.
          If Claude outputs <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm text-zinc-300">data-rack</code> in
          its HTML, it read the layout-patterns reference. No guessing required.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {signalGroups.map((group) => (
            <div key={group.skill} className="signal-card rounded-lg border border-zinc-800 p-4">
              <h3 className="mb-3 text-sm font-medium text-zinc-300">{group.skill}</h3>
              <div className="space-y-2">
                {group.signals.map((s) => (
                  <div key={s.name} className="flex items-center justify-between text-xs">
                    <code className="font-mono text-emerald-400/80">{s.name}</code>
                    <span className="text-zinc-600">{s.reference}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PromptTiersSection() {
  const tiers = [
    { num: 1, name: "Broad", desc: "Generic tasks that should NOT trigger specific references", example: "\"Add a responsive navigation bar\"" },
    { num: 2, name: "Single-reference", desc: "Each reference gets one direct prompt", example: "\"Add a CSS animation with keyframes\"" },
    { num: 3, name: "Multi-reference", desc: "Two references from the same skill", example: "\"Create a themed, animated component\"" },
    { num: 4, name: "Multi-skill", desc: "Cross 2-3 skills in one prompt", example: "\"Build a form with validation and animations\"" },
    { num: 5, name: "Edge cases", desc: "Seem related but should NOT trigger any skill", example: "\"Write a Python sorting algorithm\"" },
    { num: 6, name: "Modification", desc: "Modify existing files, should preserve conventions", example: "\"Refactor the navbar to use flexbox\"" },
    { num: 7, name: "Refactoring", desc: "Restructure code while following conventions", example: "\"Split app.js into separate modules\"" },
  ];

  return (
    <section className="border-t border-zinc-800/50 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">7-tier prompt design</h2>
        <p className="mt-4 mb-8 text-zinc-400">
          Test prompts are structured in tiers of increasing complexity.
          Each tier tests a different aspect of skill activation accuracy.
        </p>
        <div className="space-y-1">
          {tiers.map((tier) => (
            <div key={tier.num} className="tier-row group flex items-start gap-4 rounded-lg px-4 py-3 transition-colors hover:bg-zinc-900/50">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-medium text-zinc-500 border border-zinc-800 group-hover:border-zinc-700 group-hover:text-zinc-300 transition-colors">
                {tier.num}
              </span>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-zinc-300">{tier.name}</span>
                  <span className="text-xs text-zinc-600 italic truncate">{tier.example}</span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{tier.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RunYourOwnSection() {
  return (
    <section className="border-t border-zinc-800/50 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold tracking-tight">Run your own experiments</h2>
        <p className="mt-4 mb-8 text-zinc-400">
          SkillBench is open source. Clone the repo, define a hypothesis, and test it.
        </p>
        <div className="overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            <div className="h-3 w-3 rounded-full bg-zinc-800" />
            <span className="ml-2 text-xs text-zinc-600">terminal</span>
          </div>
          <pre className="p-5 text-sm leading-relaxed overflow-x-auto"><code className="text-zinc-400">{`$ git clone git@github.com:Techfolk-AS/skill-bench.git
$ cd skill-bench

# Install dependencies
$ cd scripts && pnpm install && cd ..

# Start an experiment
$ claude
> /experiment:test "Adding a TOC to reference files improves retrieval"

# Or step by step:
> /experiment:start my-hypothesis
# Edit experiments/ProjectB/.claude/ with your treatment
> /experiment:report
> /experiment:publish my-hypothesis`}</code></pre>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 p-4">
            <h3 className="text-sm font-medium text-zinc-300">Requirements</h3>
            <ul className="mt-2 space-y-1 text-xs text-zinc-500">
              <li>Docker (for isolated runs)</li>
              <li>Claude Code CLI</li>
              <li>Node.js 22+</li>
              <li>An Anthropic API key</li>
            </ul>
          </div>
          <div className="rounded-lg border border-zinc-800 p-4">
            <h3 className="text-sm font-medium text-zinc-300">What you get</h3>
            <ul className="mt-2 space-y-1 text-xs text-zinc-500">
              <li>Per-prompt grading with pass/fail evidence</li>
              <li>Statistical benchmarks (mean/stddev/delta)</li>
              <li>Standalone HTML viewer</li>
              <li>Publishable report for this dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatsBar({ reports }: { reports: ReturnType<typeof getAllReports> }) {
  const totalPrompts = reports.reduce((sum, r) => sum + r.report.prompts.length, 0);
  const withGrading = reports.filter((r) => r.report.gradingSummary);
  const avgDelta = withGrading.length
    ? withGrading.reduce((sum, r) => sum + Math.abs(r.report.gradingSummary!.delta_pass_rate), 0) / withGrading.length
    : 0;

  const stats = [
    { label: "Experiments", value: reports.length.toString() },
    { label: "Prompts tested", value: totalPrompts.toString() },
    { label: "Avg |delta|", value: `${(avgDelta * 100).toFixed(1)}%` },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 py-8">
      {stats.map((s) => (
        <div key={s.label} className="text-center">
          <div className="text-2xl font-semibold tabular-nums text-zinc-200">{s.value}</div>
          <div className="mt-1 text-xs text-zinc-500">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const reports = getAllReports();

  return (
    <div className="-mx-6 -mt-8">
      <HeroSection />
      <div className="mx-auto max-w-5xl px-6">
        <WhatSection />
        <HowItWorksSection />
        <SignalsSection />
        <PromptTiersSection />
        <RunYourOwnSection />

        <section id="experiments" className="scroll-mt-20 border-t border-zinc-800/50 py-20">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl font-semibold tracking-tight">Experiment results</h2>
            <p className="mt-1 text-sm text-zinc-500">{reports.length} experiments tracked</p>
            <StatsBar reports={reports} />
            <div className="grid gap-4">
              {reports.map(({ report, slug }) => (
                <ExperimentCard key={slug} report={report} slug={slug} />
              ))}
            </div>
          </div>
        </section>

        <footer className="border-t border-zinc-800/50 py-12 text-center text-xs text-zinc-600">
          <p>
            Built by{" "}
            <a href="https://github.com/Techfolk-AS" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Techfolk
            </a>
            {" / "}
            <a href="https://github.com/Techfolk-AS/skill-bench" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-zinc-300 transition-colors">
              Source on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
