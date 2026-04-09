import Link from "next/link";

function ComparisonTable() {
  const rows = [
    { dimension: "Scope", skillCreator: "One skill at a time", skillBench: "Entire skill system (index format, hooks, config patterns)" },
    { dimension: "What varies", skillCreator: "Skill content (body, references, description)", skillBench: "Infrastructure (CLAUDE.md index, hook injection, frontmatter, description framing)" },
    { dimension: "Isolation", skillCreator: "Subagent processes (same machine)", skillBench: "Docker containers (full environment isolation)" },
    { dimension: "Control vs Treatment", skillCreator: "with_skill vs without_skill (or old vs new)", skillBench: "ProjectA vs ProjectB (identical template, one config change)" },
    { dimension: "Measurement", skillCreator: "Output assertions + timing + tokens", skillBench: "Event logs (skill loads, ref reads, tool calls) + output verification signals" },
    { dimension: "Signal design", skillCreator: "User-defined assertions per prompt", skillBench: "Embedded naming conventions that prove a reference was read" },
    { dimension: "Prompt design", skillCreator: "2-3 ad hoc prompts per skill", skillBench: "7-tier structured system (10+ prompts per experiment)" },
    { dimension: "Grading", skillCreator: "Subagent or script evaluates assertions", skillBench: "Automated signal detection + assertion framework" },
    { dimension: "Iteration", skillCreator: "Edit skill, rerun, compare iterations", skillBench: "Edit config, rerun in Docker, compare A/B" },
    { dimension: "Viewer", skillCreator: "Python HTTP server or static HTML", skillBench: "Next.js dashboard (Vercel-deployed)" },
    { dimension: "Persistence", skillCreator: "Workspace directories per iteration", skillBench: "Published JSON reports, permanent dashboard" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="py-3 pr-4 text-left font-medium text-zinc-400 w-1/4" />
            <th className="py-3 px-4 text-left font-medium text-zinc-400 w-[37.5%]">Skill Creator</th>
            <th className="py-3 pl-4 text-left font-medium text-zinc-400 w-[37.5%]">SkillBench</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.dimension} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
              <td className="py-3 pr-4 text-zinc-300 font-medium">{row.dimension}</td>
              <td className="py-3 px-4 text-zinc-500">{row.skillCreator}</td>
              <td className="py-3 pl-4 text-zinc-500">{row.skillBench}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ArchitectureDiagram() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-300">Skill Creator flow</h3>
        <div className="flow-diagram rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="flow-node rounded border border-indigo-800/60 bg-indigo-900/20 px-3 py-1.5 text-indigo-400">Draft skill</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-indigo-800/60 bg-indigo-900/20 px-3 py-1.5 text-indigo-400">Spawn subagents</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-indigo-800/60 bg-indigo-900/20 px-3 py-1.5 text-indigo-400">with_skill + baseline</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-indigo-800/60 bg-indigo-900/20 px-3 py-1.5 text-indigo-400">Grade assertions</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-indigo-800/60 bg-indigo-900/20 px-3 py-1.5 text-indigo-400">Human review</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-zinc-700 bg-zinc-800/40 px-3 py-1.5 text-zinc-400">Iterate</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-4 text-sm font-medium text-zinc-300">SkillBench flow</h3>
        <div className="flow-diagram rounded-lg border border-zinc-800 bg-zinc-950 p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <span className="flow-node rounded border border-emerald-800/60 bg-emerald-900/20 px-3 py-1.5 text-emerald-400">Hypothesis</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-emerald-800/60 bg-emerald-900/20 px-3 py-1.5 text-emerald-400">Template + treatment</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-emerald-800/60 bg-emerald-900/20 px-3 py-1.5 text-emerald-400">Docker isolation</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-emerald-800/60 bg-emerald-900/20 px-3 py-1.5 text-emerald-400">Signal detection</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-emerald-800/60 bg-emerald-900/20 px-3 py-1.5 text-emerald-400">Grade + benchmark</span>
            <span className="text-zinc-700">&rarr;</span>
            <span className="flow-node rounded border border-zinc-700 bg-zinc-800/40 px-3 py-1.5 text-zinc-400">Publish</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MethodologyPage() {
  return (
    <div className="space-y-0">
      <section className="methodology-hero relative overflow-hidden py-20">
        <div className="methodology-glow" />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
            &larr; Back
          </Link>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            SkillBench vs <span className="gradient-text-alt">Skill Creator</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Two tools for testing Claude Code skills. Different layers, complementary goals.
          </p>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">The short version</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-indigo-800/40 bg-indigo-900/10 p-5">
              <h3 className="text-sm font-medium text-indigo-400">Skill Creator</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                &ldquo;Does this skill produce good output?&rdquo;
              </p>
              <p className="mt-3 text-xs text-zinc-600">
                Tests the <strong className="text-zinc-400">execution layer</strong>.
                Given that Claude activated the skill, does the skill&apos;s content lead to quality results?
              </p>
            </div>
            <div className="rounded-lg border border-emerald-800/40 bg-emerald-900/10 p-5">
              <h3 className="text-sm font-medium text-emerald-400">SkillBench</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                &ldquo;Does Claude find and use the right skills?&rdquo;
              </p>
              <p className="mt-3 text-xs text-zinc-600">
                Tests the <strong className="text-zinc-400">retrieval/activation layer</strong>.
                Does the configuration make Claude discover, load, and read the correct skill and references?
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">How Skill Creator works</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            Skill Creator is a meta-skill bundled with Claude Code.
            It helps you write a skill, test it against a few prompts, and iterate until the output quality is good.
          </p>
          <div className="mt-6 space-y-0">
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-indigo-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Write test prompts</h3>
              <p className="mt-1 text-xs text-zinc-500">2-3 realistic prompts saved to evals.json. Each prompt describes a task a real user would give Claude.</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-indigo-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Spawn parallel subagents</h3>
              <p className="mt-1 text-xs text-zinc-500">For each prompt, two subagents run simultaneously: one with the skill, one without (or with the old version).</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-indigo-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Grade with assertions</h3>
              <p className="mt-1 text-xs text-zinc-500">User-defined assertions are evaluated by a grader subagent or script. Results include pass/fail, timing, and token usage.</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-indigo-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Human review in viewer</h3>
              <p className="mt-1 text-xs text-zinc-500">A Python-generated HTML viewer shows side-by-side outputs. The user leaves qualitative feedback per test case.</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-indigo-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Iterate</h3>
              <p className="mt-1 text-xs text-zinc-500">Revise the skill based on feedback, rerun all prompts into iteration-N+1/, compare with previous iteration in the viewer.</p>
            </div>
          </div>
          <p className="mt-6 text-sm text-zinc-500">
            There&apos;s also a separate <strong className="text-zinc-400">description optimization</strong> loop
            that generates 20 should-trigger/should-not-trigger queries and tunes the SKILL.md description
            field for better activation accuracy.
          </p>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">How SkillBench works</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            SkillBench tests the system-level configuration, not individual skill content.
            It measures whether a change to the skill index format, hook injection strategy,
            or description framing affects Claude&apos;s ability to find and use the right skills.
          </p>
          <div className="mt-6 space-y-0">
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-emerald-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Hypothesis from a claim</h3>
              <p className="mt-1 text-xs text-zinc-500">Start with a blog post, documentation change, or intuition. &ldquo;Adding a TOC to reference files helps Claude find the right section.&rdquo;</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-emerald-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Template with planted signals</h3>
              <p className="mt-1 text-xs text-zinc-500">A test project with CSS/HTML/JS skills whose references embed unique markers. If Claude outputs <code className="rounded bg-zinc-800 px-1 text-emerald-400/80">data-rack</code>, it read layout-patterns.</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-emerald-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Docker-isolated A/B runs</h3>
              <p className="mt-1 text-xs text-zinc-500">Each prompt runs in a fresh container. Event hooks log every skill load, reference read, and tool call. No context bleeds between prompts.</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-emerald-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Automated grading</h3>
              <p className="mt-1 text-xs text-zinc-500">Signal presence/absence, skill activation, reference reads. Binary, no interpretation needed. Aggregated into pass rates with mean/stddev/delta.</p>
            </div>
            <div className="step-card group relative border-l border-zinc-800 py-4 pl-8">
              <div className="step-dot absolute -left-[5px] top-6 h-2.5 w-2.5 rounded-full border-2 border-emerald-800/60 bg-zinc-900" />
              <h3 className="text-sm font-medium text-zinc-300">Publish to dashboard</h3>
              <p className="mt-1 text-xs text-zinc-500">Results publish as JSON to this dashboard. Each experiment becomes a permanent, browsable record with per-prompt breakdowns.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">Side-by-side comparison</h2>
          <p className="mt-4 mb-8 text-zinc-400">
            The differences are architectural. Each tool optimizes a different part of the skill lifecycle.
          </p>
          <ComparisonTable />
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">Visual comparison</h2>
          <p className="mt-4 mb-8 text-zinc-400">
            The two pipelines are structurally similar but operate at different layers.
          </p>
          <ArchitectureDiagram />
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">Key differences</h2>
          <div className="mt-8 space-y-8">
            <div>
              <h3 className="text-sm font-medium text-zinc-300">What they measure</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Skill Creator asks &ldquo;given that Claude is using this skill, does the output meet quality expectations?&rdquo;
                SkillBench asks &ldquo;given this system configuration, does Claude correctly discover, load, and apply
                the right skill for each prompt?&rdquo; One tests execution quality. The other tests retrieval accuracy.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300">How they verify</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Skill Creator uses grader subagents that interpret output quality. This works well for subjective assessment
                but introduces variance. SkillBench uses planted verification signals: unique data attributes, CSS custom
                properties, and function names embedded in reference files. If <code className="rounded bg-zinc-800 px-1 text-emerald-400/80">data-rack</code> appears
                in the output, the layout-patterns reference was read. Binary, deterministic, no interpretation needed.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Isolation model</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Skill Creator runs subagent processes on the same machine. State can theoretically bleed.
                SkillBench runs each prompt in a fresh Docker container with only the API key injected.
                No conversation context, no filesystem state, no ambient configuration can affect results.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-zinc-300">Scale and structure</h3>
              <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                Skill Creator uses 2-3 ad hoc prompts per iteration, optimized for fast feedback loops
                during development. SkillBench uses a structured 7-tier prompt design with 8-10 prompts
                per experiment, covering broad tasks, single-reference, multi-reference, multi-skill,
                edge cases, modification, and refactoring. This tests activation accuracy across the full
                spectrum of prompt types.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-xl font-semibold tracking-tight">How they complement each other</h2>
          <p className="mt-4 text-zinc-400 leading-relaxed">
            The ideal workflow uses both:
          </p>
          <div className="mt-6 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800">
              <div className="p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-800/40 bg-indigo-900/20 px-3 py-1 text-xs text-indigo-400">
                  Phase 1
                </div>
                <h3 className="text-sm font-medium text-zinc-300">Develop the skill</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Use Skill Creator to write the skill body, test output quality, iterate on content,
                  and optimize the description for triggering. End result: a skill that produces good
                  outputs when activated.
                </p>
              </div>
              <div className="p-6">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-800/40 bg-emerald-900/20 px-3 py-1 text-xs text-emerald-400">
                  Phase 2
                </div>
                <h3 className="text-sm font-medium text-zinc-300">Test the system</h3>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  Use SkillBench to test whether the skill is discovered reliably in the context of
                  the full system: CLAUDE.md index, hook injection, other competing skills. End result:
                  confidence that the skill activates when it should and stays quiet when it shouldn&apos;t.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-800/50 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-zinc-500">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              View experiment results
            </Link>
            {" / "}
            <a href="https://github.com/Techfolk-AS/skill-bench" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-colors">
              GitHub
            </a>
          </p>
        </div>
      </section>
    </div>
  );
}
