#!/usr/bin/env node
import { readFileSync, appendFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

// Types for hook events
interface BaseHookInput {
  session_id: string;
  cwd: string;
  hook_event_name: string;
}

interface ToolUseInput extends BaseHookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
}

interface UserPromptInput extends BaseHookInput {
  prompt?: string;
}

interface SubagentInput extends BaseHookInput {
  subagent_type?: string;
  subagent_id?: string;
  prompt?: string;
}

interface SessionInput extends BaseHookInput {
  transcript_path?: string;
}

type HookInput = ToolUseInput | UserPromptInput | SubagentInput | SessionInput;

interface SkillState {
  skillsUsed: string[];
}

function getSkillName(tool: string, input: Record<string, unknown>): string | null {
  if (tool === 'Skill') return (input.skill || input.command) as string || null;
  if (tool === 'Read' && input.file_path) {
    const match = String(input.file_path).match(/skills\/([^/]+)\/SKILL\.md/);
    if (match) return match[1];
  }
  return null;
}

function trackSkill(sessionId: string, skillName: string): void {
  const file = join(getLogDir(), `skills-used-${sessionId}.json`);
  let state: SkillState = { skillsUsed: [] };
  try {
    if (existsSync(file)) state = JSON.parse(readFileSync(file, 'utf8'));
  } catch {}
  if (!state.skillsUsed.includes(skillName)) {
    state.skillsUsed.push(skillName);
    writeFileSync(file, JSON.stringify(state, null, 2));
  }
}

// Log entry structure
interface LogEntry {
  timestamp: string;
  event: string;
  session_id: string;
  tool?: string;
  summary: string;
  details?: Record<string, unknown>;
}

function getLogDir(): string {
  const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
  const logDir = join(projectDir, '.claude', 'logs');
  if (!existsSync(logDir)) {
    mkdirSync(logDir, { recursive: true });
  }
  return logDir;
}

function getLogFile(): string {
  const date = new Date().toISOString().split('T')[0];
  return join(getLogDir(), `claude-events-${date}.jsonl`);
}

function formatToolInput(tool: string, input: Record<string, unknown>): string {
  switch (tool) {
    case 'Read':
      return `${input.file_path}`;
    case 'Write':
      return `${input.file_path}`;
    case 'Edit':
      return `${input.file_path}`;
    case 'Bash':
      const cmd = String(input.command || '');
      return cmd.length > 60 ? cmd.slice(0, 60) + '...' : cmd;
    case 'Glob':
      return `${input.pattern}`;
    case 'Grep':
      return `${input.pattern} in ${input.path || 'cwd'}`;
    case 'Task':
      return `[${input.subagent_type}] ${input.description}`;
    case 'Skill':
      return `/${input.skill || input.command}${input.args ? ' ' + input.args : ''}`;
    case 'WebFetch':
      return `${input.url}`;
    case 'WebSearch':
      return `"${input.query}"`;
    default:
      return JSON.stringify(input).slice(0, 80);
  }
}

function isInteresting(event: string, data: HookInput): boolean {
  if (event === 'UserPromptSubmit') return true;
  if (event.includes('Session') || event.includes('Subagent')) return true;

  const toolData = data as ToolUseInput;
  const tool = toolData.tool_name;

  // Always log skill and task invocations
  if (tool === 'Skill' || tool === 'Task') return true;

  // Log file operations on .claude/ paths
  if (['Read', 'Write', 'Edit'].includes(tool)) {
    const filePath = String(toolData.tool_input?.file_path || '');
    if (filePath.includes('.claude/') || filePath.includes('/skills/') || filePath.includes('/commands/')) {
      return true;
    }
  }

  return true; // Log everything for now - filter in analysis
}

function createSummary(event: string, data: HookInput): string {
  if (event === 'UserPromptSubmit') {
    const prompt = ((data as UserPromptInput).prompt || '').slice(0, 100);
    return `💬 Prompt: ${prompt}`;
  }
  if (event === 'SessionStart') return '🚀 Session started';
  if (event === 'SessionEnd') return '🏁 Session ended';
  if (event === 'SubagentStart') {
    const d = data as SubagentInput;
    return `🤖 Subagent started: ${d.subagent_type || 'unknown'}`;
  }
  if (event === 'SubagentStop') return '🤖 Subagent stopped';

  const toolData = data as ToolUseInput;
  const tool = toolData.tool_name;
  const input = toolData.tool_input || {};

  const prefix = event === 'PreToolUse' ? '→' : event === 'PostToolUse' ? '✓' : '✗';
  const formatted = formatToolInput(tool, input);

  // Highlight interesting tools
  if (tool === 'Skill') return `${prefix} 📚 Skill: ${formatted}`;
  if (tool === 'Task') return `${prefix} 🔀 Task: ${formatted}`;

  const skillName = getSkillName(tool, input);
  if (skillName) return `${prefix} 📚 Skill: ${skillName}`;

  return `${prefix} ${tool}: ${formatted}`;
}

function extractDetails(event: string, data: HookInput): Record<string, unknown> | undefined {
  if (event === 'UserPromptSubmit') {
    const prompt = (data as UserPromptInput).prompt || '';
    return { prompt: prompt.slice(0, 100) };
  }

  const toolData = data as ToolUseInput;

  if (toolData.tool_name === 'Skill') {
    return { skill: (toolData.tool_input?.skill || toolData.tool_input?.command) as string, args: toolData.tool_input?.args };
  }
  if (toolData.tool_name === 'Task') {
    return {
      subagent_type: toolData.tool_input?.subagent_type,
      description: toolData.tool_input?.description,
      prompt: String(toolData.tool_input?.prompt || '').slice(0, 200)
    };
  }
  if (toolData.tool_name === 'Read') {
    const filePath = String(toolData.tool_input?.file_path || '');
    const skillName = getSkillName('Read', toolData.tool_input || {});
    if (skillName) return { skill: skillName, file_path: filePath };
    if (filePath.includes('.claude/')) return { file_path: filePath };
  }
  if (['Write', 'Edit'].includes(toolData.tool_name)) {
    const filePath = String(toolData.tool_input?.file_path || '');
    if (filePath.includes('.claude/')) {
      return { file_path: filePath };
    }
  }

  return undefined;
}

async function main() {
  try {
    const input = readFileSync(0, 'utf-8');
    const data: HookInput = JSON.parse(input);
    const event = data.hook_event_name;

    if (!isInteresting(event, data)) {
      process.exit(0);
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      event,
      session_id: data.session_id,
      tool: (data as ToolUseInput).tool_name,
      summary: createSummary(event, data),
      details: extractDetails(event, data)
    };

    // Write JSONL
    appendFileSync(getLogFile(), JSON.stringify(entry) + '\n');

    const toolData = data as ToolUseInput;

    if (event === 'PostToolUse') {
      const skillName = getSkillName(toolData.tool_name, toolData.tool_input || {});
      if (skillName) trackSkill(data.session_id, skillName);
    }

    const isSkillEvent = getSkillName(toolData.tool_name, toolData.tool_input || {}) !== null;
    if (isSkillEvent || toolData.tool_name === 'Task' || event.includes('Subagent')) {
      console.log(entry.summary);
    }

    process.exit(0);
  } catch (err) {
    // Silent fail - don't break Claude
    process.exit(0);
  }
}

main();
