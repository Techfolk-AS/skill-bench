import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { execSync } from "node:child_process";

const repoRoot = resolve(import.meta.dirname!, "..");
const experimentsDir = join(repoRoot, "experiments");
const args = process.argv.slice(2);
const experimentName = args[0];

if (!experimentName) {
  console.error("Usage: npx tsx launch-viewer.ts <experiment-name>");
  process.exit(1);
}

const expDir = join(experimentsDir, "results", experimentName);

const reportFiles = readdirSync(expDir).filter((f) => f.endsWith(".json") && f.includes(experimentName) && !f.includes("benchmark") && !f.includes("grading"));
const reportFile = reportFiles.sort().pop();
const report = reportFile ? JSON.parse(readFileSync(join(expDir, reportFile), "utf-8")) : null;

const benchmarkFile = readdirSync(expDir).find((f) => f.includes("benchmark"));
const benchmark = benchmarkFile ? JSON.parse(readFileSync(join(expDir, benchmarkFile), "utf-8")) : null;

const gradingDir = join(expDir, "grading");
const gradings: Record<string, unknown>[] = [];
if (existsSync(gradingDir)) {
  for (const f of readdirSync(gradingDir).filter((f) => f.startsWith("prompt-")).sort()) {
    gradings.push(JSON.parse(readFileSync(join(gradingDir, f), "utf-8")));
  }
}

function parseExperimentLog(dir: string): { source: string; hypothesis: string; treatment: string; insights: string[] } {
  const logPath = join(dir, "log.md");
  if (!existsSync(logPath)) return { source: "", hypothesis: "", treatment: "", insights: [] };
  const content = readFileSync(logPath, "utf-8");
  const sourceMatch = content.match(/\*\*Source:\*\*\s*(.*)/);
  const hypMatch = content.match(/## Hypothesis\s*\n\s*\n?([\s\S]*?)(?=\n##)/);
  const implMatch = content.match(/## Implementation\s*\n\s*\n?([\s\S]*?)(?=\n##|\n*$)/);
  const insightsMatch = content.match(/## Insights\s*\n\s*\n?([\s\S]*?)(?=\n## )/);
  const insightsRaw = insightsMatch?.[1]?.trim() ?? "";
  const insights = insightsRaw
    .split(/\n(?=\d+\.\s)/)
    .map(s => s.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
  return {
    source: sourceMatch?.[1]?.trim() ?? "",
    hypothesis: hypMatch?.[1]?.trim().split("\n")[0] ?? "",
    treatment: implMatch?.[1]?.trim().replace(/^ProjectB change:\s*/i, "") ?? "",
    insights,
  };
}

function escapeHtmlBuild(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const expLog = parseExperimentLog(expDir);

function computeVerdict(): { delta: string; verdict: string; verdictClass: string; controlRate: string; treatmentRate: string; promptCount: number; timeNote: string } {
  if (!benchmark?.run_summary) return { delta: "N/A", verdict: "No data", verdictClass: "neutral", controlRate: "N/A", treatmentRate: "N/A", promptCount: 0, timeNote: "" };
  const rs = benchmark.run_summary;
  const d = rs.treatment.pass_rate.mean - rs.control.pass_rate.mean;
  const timeDelta = rs.treatment.time_seconds.mean - rs.control.time_seconds.mean;
  const verdict = d > 0.1 ? "Positive impact" : d < -0.05 ? "Negative impact" : "No significant difference";
  const verdictClass = d > 0.1 ? "positive" : d < -0.05 ? "negative" : "neutral";
  const timeNote = Math.abs(timeDelta) > 3 ? `${timeDelta > 0 ? "+" : ""}${timeDelta.toFixed(1)}s avg time` : "";
  return {
    delta: `${d >= 0 ? "+" : ""}${(d * 100).toFixed(1)}%`,
    verdict,
    verdictClass,
    controlRate: `${(rs.control.pass_rate.mean * 100).toFixed(0)}%`,
    treatmentRate: `${(rs.treatment.pass_rate.mean * 100).toFixed(0)}%`,
    promptCount: benchmark.metadata?.prompts_evaluated ?? 0,
    timeNote,
  };
}

const verdict = computeVerdict();

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Experiment: ${experimentName}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0d1117; color: #c9d1d9; }
  .hero { padding: 32px 24px 24px; border-bottom: 1px solid #21262d; }
  .hero-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; }
  .hero-title { font-size: 22px; font-weight: 700; letter-spacing: -0.3px; }
  .hero-date { color: #6e7681; font-size: 12px; padding-top: 6px; }
  .hero-hypothesis { font-size: 15px; color: #c9d1d9; line-height: 1.5; margin-bottom: 20px; max-width: 720px; }
  .hero-cards { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .hero-card { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 14px 16px; }
  .hero-card .card-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #6e7681; margin-bottom: 6px; }
  .hero-card .card-value { font-size: 24px; font-weight: 700; }
  .hero-card .card-sub { font-size: 11px; color: #6e7681; margin-top: 2px; }
  .verdict-positive .card-value { color: #3fb950; }
  .verdict-negative .card-value { color: #f85149; }
  .verdict-neutral .card-value { color: #8b949e; }
  .hero-footer { display: flex; gap: 20px; font-size: 12px; color: #6e7681; align-items: center; flex-wrap: wrap; }
  .hero-footer a { color: #58a6ff; text-decoration: none; }
  .hero-footer a:hover { text-decoration: underline; }
  .insights { margin-bottom: 20px; }
  .insight { padding: 12px 16px; background: #161b22; border-left: 3px solid #f0883e; border-radius: 0 8px 8px 0; margin-bottom: 8px; font-size: 13px; line-height: 1.6; }
  .insight strong { color: #f0883e; }
  .insights-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #f0883e; margin-bottom: 8px; }
  .treatment-tag { display: inline-flex; align-items: center; gap: 6px; background: #f7816618; border: 1px solid #f7816633; color: #f78166; padding: 4px 10px; border-radius: 6px; font-size: 12px; max-width: 100%; }
  .treatment-tag .tag-label { font-weight: 600; flex-shrink: 0; }
  .tabs { display: flex; gap: 0; border-bottom: 1px solid #21262d; padding: 0 24px; }
  .tab { padding: 12px 16px; cursor: pointer; border-bottom: 2px solid transparent; color: #8b949e; font-size: 14px; }
  .tab.active { color: #c9d1d9; border-bottom-color: #f78166; }
  .content { padding: 24px; max-width: 1200px; margin: 0 auto; }
  .panel { display: none; }
  .panel.active { display: block; }
  .nav { display: flex; gap: 8px; margin-bottom: 20px; align-items: center; }
  .nav button { padding: 6px 14px; background: #21262d; border: 1px solid #30363d; color: #c9d1d9; border-radius: 6px; cursor: pointer; font-size: 13px; }
  .nav button:hover { background: #30363d; }
  .nav span { color: #8b949e; font-size: 13px; }
  .prompt-text { background: #161b22; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #21262d; }
  .prompt-text .label { font-size: 11px; text-transform: uppercase; color: #8b949e; margin-bottom: 6px; letter-spacing: 0.5px; }
  .prompt-text p { font-size: 14px; line-height: 1.5; }
  .comparison { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .side { background: #161b22; border: 1px solid #21262d; border-radius: 8px; padding: 16px; }
  .side h3 { font-size: 13px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; }
  .side h3 .badge { padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 500; }
  .badge-control { background: #1f6feb33; color: #58a6ff; }
  .badge-treatment { background: #f7816633; color: #f78166; }
  .metric { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #21262d; font-size: 13px; }
  .metric:last-child { border-bottom: none; }
  .metric .label { color: #8b949e; }
  .signals { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 8px; }
  .signal { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-family: monospace; }
  .signal-present { background: #23863633; color: #3fb950; }
  .signal-absent { background: transparent; color: #484f58; border: 1px solid #21262d; }
  .assertions { margin-top: 12px; }
  .assertion { display: flex; gap: 8px; padding: 4px 0; font-size: 12px; }
  .assertion .icon { flex-shrink: 0; }
  .pass { color: #3fb950; }
  .fail { color: #f85149; }
  .evidence { color: #8b949e; font-size: 11px; margin-left: 20px; }
  .bench-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .bench-table th, .bench-table td { padding: 10px 14px; text-align: left; border-bottom: 1px solid #21262d; }
  .bench-table th { color: #8b949e; font-weight: 500; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .bench-table tr:hover { background: #161b22; }
  .delta-positive { color: #3fb950; }
  .delta-negative { color: #f85149; }
  .delta-neutral { color: #8b949e; }
  .notes { margin-top: 20px; }
  .note { padding: 8px 12px; background: #161b22; border-left: 3px solid #f78166; margin-bottom: 8px; border-radius: 0 6px 6px 0; font-size: 13px; }
</style>
</head>
<body>
<div class="hero">
  <div class="hero-top">
    <div class="hero-title">${experimentName}</div>
    <div class="hero-date">${report?.date ?? ""}</div>
  </div>
  ${expLog.hypothesis ? `<div class="hero-hypothesis">${expLog.hypothesis}</div>` : ""}
  ${expLog.insights.length > 0 ? `<div class="insights"><div class="insights-label">Insights</div>${expLog.insights.map(i => `<div class="insight">${escapeHtmlBuild(i)}</div>`).join("")}</div>` : ""}
  <div class="hero-cards">
    <div class="hero-card">
      <div class="card-label">Control</div>
      <div class="card-value" style="color:#58a6ff">${verdict.controlRate}</div>
      <div class="card-sub">pass rate (baseline)</div>
    </div>
    <div class="hero-card">
      <div class="card-label">Treatment</div>
      <div class="card-value" style="color:#f78166">${verdict.treatmentRate}</div>
      <div class="card-sub">pass rate (with change)</div>
    </div>
    <div class="hero-card verdict-${verdict.verdictClass}">
      <div class="card-label">Result</div>
      <div class="card-value">${verdict.delta}</div>
      <div class="card-sub">${verdict.verdict}${verdict.timeNote ? " / " + verdict.timeNote : ""}</div>
    </div>
  </div>
  <div class="hero-footer">
    ${expLog.treatment ? `<div class="treatment-tag"><span class="tag-label">Treatment:</span> ${expLog.treatment}</div>` : ""}
  </div>
  <div class="hero-footer" style="margin-top:8px">
    <span>${verdict.promptCount} prompts evaluated</span>
    ${expLog.source ? `<a href="${expLog.source}" target="_blank" rel="noopener">Source article</a>` : ""}
  </div>
</div>
<div class="tabs">
  <div class="tab active" onclick="switchTab('outputs')">Outputs</div>
  <div class="tab" onclick="switchTab('benchmark')">Benchmark</div>
</div>
<div class="content">
  <div id="outputs-panel" class="panel active"></div>
  <div id="benchmark-panel" class="panel"></div>
</div>
<script>
const report = ${JSON.stringify(report)};
const benchmark = ${JSON.stringify(benchmark)};
const gradings = ${JSON.stringify(gradings)};
const allSignals = ${JSON.stringify(report?.signalMap ? Object.keys(report.signalMap) : [])};
let currentPrompt = 0;

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.tab:nth-child(' + (tab === 'outputs' ? 1 : 2) + ')').classList.add('active');
  document.getElementById(tab + '-panel').classList.add('active');
}

function renderOutputs() {
  if (!report || !report.prompts) { document.getElementById('outputs-panel').innerHTML = '<p>No report data.</p>'; return; }
  const prompts = report.prompts;
  const total = prompts.length;

  window.navigatePrompt = function(idx) {
    currentPrompt = idx;
    const p = prompts[idx];
    const g = gradings.find(gr => gr.prompt_number === p.number);
    const panel = document.getElementById('outputs-panel');

    let html = '<div class="nav">';
    html += '<button onclick="navigatePrompt(' + Math.max(0, idx-1) + ')">&larr; Prev</button>';
    html += '<span>Prompt ' + (idx+1) + ' of ' + total + '</span>';
    html += '<button onclick="navigatePrompt(' + Math.min(total-1, idx+1) + ')">Next &rarr;</button>';
    html += '</div>';

    html += '<div class="prompt-text"><div class="label">Prompt #' + p.number + '</div><p>' + escapeHtml(p.text) + '</p></div>';

    html += '<div class="comparison">';
    html += renderSide('Control', 'control', p.control, g?.control, report.signalMap);
    html += renderSide('Treatment', 'treatment', p.treatment, g?.treatment, report.signalMap);
    html += '</div>';

    panel.innerHTML = html;
  };

  function renderSide(label, variant, data, grading, signalMap) {
    const badgeClass = variant === 'control' ? 'badge-control' : 'badge-treatment';
    let h = '<div class="side"><h3><span class="badge ' + badgeClass + '">' + label + '</span></h3>';
    if (!data) { h += '<p style="color:#8b949e">No data</p></div>'; return h; }

    h += '<div class="metric"><span class="label">Events</span><span>' + data.events + '</span></div>';
    h += '<div class="metric"><span class="label">Duration</span><span>' + (data.durationMs/1000).toFixed(1) + 's</span></div>';
    h += '<div class="metric"><span class="label">Skills</span><span>' + (data.skillsLoaded.join(', ') || 'none') + '</span></div>';

    const subReads = Object.entries(data.subskillReads || {}).flatMap(([s,refs]) => refs.map(r => s+'/'+r));
    h += '<div class="metric"><span class="label">Refs read</span><span>' + (subReads.join(', ') || 'none') + '</span></div>';

    h += '<div style="margin-top:8px;font-size:11px;color:#8b949e">Signals:</div><div class="signals">';
    for (const sig of allSignals) {
      const present = data.signals.includes(sig);
      h += '<span class="signal ' + (present ? 'signal-present' : 'signal-absent') + '">' + escapeHtml(sig) + '</span>';
    }
    h += '</div>';

    if (grading && grading.expectations) {
      h += '<div class="assertions" style="margin-top:12px"><div style="font-size:11px;color:#8b949e;margin-bottom:6px">Assertions (' + grading.summary.passed + '/' + grading.summary.total + ')</div>';
      for (const e of grading.expectations) {
        h += '<div class="assertion"><span class="icon ' + (e.passed ? 'pass' : 'fail') + '">' + (e.passed ? '&#10003;' : '&#10007;') + '</span><span>' + escapeHtml(e.text) + '</span></div>';
        h += '<div class="evidence">' + escapeHtml(e.evidence) + '</div>';
      }
      h += '</div>';
    }

    h += '</div>';
    return h;
  }

  navigatePrompt(0);
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'ArrowLeft') navigatePrompt(Math.max(0, currentPrompt-1));
    if (e.key === 'ArrowRight') navigatePrompt(Math.min(total-1, currentPrompt+1));
  });
}

function renderBenchmark() {
  const panel = document.getElementById('benchmark-panel');
  if (!benchmark) { panel.innerHTML = '<p>No benchmark data. Run grade + benchmark first.</p>'; return; }

  let html = '<h2 style="font-size:16px;margin-bottom:16px">Benchmark Summary</h2>';

  const rs = benchmark.run_summary;
  html += '<table class="bench-table"><thead><tr><th>Metric</th><th>Control</th><th>Treatment</th><th>Delta</th></tr></thead><tbody>';
  html += benchRow('Pass Rate', fmtPct(rs.control.pass_rate.mean), fmtPct(rs.treatment.pass_rate.mean), rs.delta.pass_rate);
  html += benchRow('Time (avg)', rs.control.time_seconds.mean.toFixed(1) + 's', rs.treatment.time_seconds.mean.toFixed(1) + 's', rs.delta.time_seconds);
  html += '</tbody></table>';

  html += '<h3 style="font-size:14px;margin:24px 0 12px">Per-Prompt Breakdown</h3>';
  html += '<table class="bench-table"><thead><tr><th>Prompt</th><th>Control</th><th>Treatment</th><th>Delta</th></tr></thead><tbody>';

  const byEval = {};
  for (const run of benchmark.runs) {
    if (!byEval[run.eval_id]) byEval[run.eval_id] = {};
    byEval[run.eval_id][run.configuration] = run;
  }
  for (const [id, sides] of Object.entries(byEval)) {
    const c = sides.control?.result;
    const t = sides.treatment?.result;
    const d = (t?.pass_rate ?? 0) - (c?.pass_rate ?? 0);
    const dClass = d > 0.05 ? 'delta-positive' : d < -0.05 ? 'delta-negative' : 'delta-neutral';
    html += '<tr><td>#' + id + '</td><td>' + fmtPct(c?.pass_rate) + '</td><td>' + fmtPct(t?.pass_rate) + '</td><td class="' + dClass + '">' + (d >= 0 ? '+' : '') + (d*100).toFixed(0) + '%</td></tr>';
  }
  html += '</tbody></table>';

  if (benchmark.notes && benchmark.notes.length > 0) {
    html += '<div class="notes"><h3 style="font-size:14px;margin:24px 0 12px">Analysis Notes</h3>';
    for (const note of benchmark.notes) html += '<div class="note">' + escapeHtml(note) + '</div>';
    html += '</div>';
  }

  panel.innerHTML = html;
}

function benchRow(label, control, treatment, delta) {
  const dVal = parseFloat(delta);
  const dClass = dVal > 0 ? 'delta-positive' : dVal < 0 ? 'delta-negative' : 'delta-neutral';
  return '<tr><td>' + label + '</td><td>' + control + '</td><td>' + treatment + '</td><td class="' + dClass + '">' + delta + '</td></tr>';
}
function fmtPct(v) { return v != null ? (v * 100).toFixed(1) + '%' : 'N/A'; }
function escapeHtml(s) { return s ? String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;') : ''; }

renderOutputs();
renderBenchmark();
</script>
</body>
</html>`;

const outPath = `/tmp/experiment-viewer-${experimentName}.html`;
writeFileSync(outPath, html);
execSync(`open "${outPath}"`);
console.log(`Viewer opened: ${outPath}`);
