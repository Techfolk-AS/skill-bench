export interface SideSnapshot {
  events: number;
  durationMs: number;
  skillsLoaded: string[];
  subskillReads: Record<string, string[]>;
  toolCounts: Record<string, number>;
  signals: string[];
}

export interface GradingExpectation {
  text: string;
  passed: boolean;
  evidence: string;
}

export interface GradingSide {
  expectations: GradingExpectation[];
  summary: {
    passed: number;
    failed: number;
    total: number;
    pass_rate: number;
  };
}

export interface PromptGrading {
  prompt_number: number;
  prompt_text: string;
  control: GradingSide;
  treatment: GradingSide;
}

export interface PromptResult {
  number: number;
  text: string;
  control: SideSnapshot | null;
  treatment: SideSnapshot | null;
  grading?: PromptGrading;
}

export interface TotalsSide {
  sessions: number;
  prompts: number;
  events: number;
  skillsLoaded: string[];
  toolCounts: Record<string, number>;
  subskillReads: Record<string, string[]>;
  signals: string[];
}

export interface SummaryResult {
  skillMatchRate: string;
  refMatchRate: string;
  toolMatchRate: string;
  signalMatchRate: string;
  conclusion: "equivalent" | "differences_detected";
  details: string;
}

export interface GradingSummary {
  experiment: string;
  date: string;
  prompts_graded: number;
  control: { passed: number; total: number; pass_rate: number };
  treatment: { passed: number; total: number; pass_rate: number };
  delta_pass_rate: number;
}

export interface ExperimentReport {
  version: number;
  date: string;
  experiment: {
    name: string | null;
    control: string;
    treatment: string;
    insights?: string[];
    cliVersion?: string;
    source?: string;
  };
  prompts: PromptResult[];
  totals: {
    control: TotalsSide;
    treatment: TotalsSide;
  };
  signalMap: Record<
    string,
    { control: boolean; treatment: boolean; proves: string }
  >;
  summary: SummaryResult;
  gradingSummary?: GradingSummary;
}
