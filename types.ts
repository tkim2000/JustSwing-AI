
export interface SwingMetric {
  label: string;
  value: string | number;
  unit?: string;
  status: 'optimal' | 'warning' | 'critical';
}

export interface SwingPhaseAnalysis {
  score: number; // 0-100
  feedback: string;
  drills: string[];
  timestamp?: string; // Format "0:00"
}

export interface SwingReport {
  overallScore: number;
  estimatedStats: {
    exitVelocity?: string;
    launchAngle?: string;
    batSpeed?: string;
  };
  metrics: {
    stance: SwingPhaseAnalysis;
    load: SwingPhaseAnalysis;
    path: SwingPhaseAnalysis;
    followThrough: SwingPhaseAnalysis;
  };
  keyIssues: string[];
  summary: string;
  videoUrl?: string; // Local blob URL for the analyzed video
}

export interface ComparativeReport {
  comparisonSummary: string;
  improvements: string[];
  regressions: string[];
  metricDeltas: {
    label: string;
    change: string;
    direction: 'better' | 'worse' | 'neutral';
  }[];
}

export interface Drill {
  id: string;
  title: string;
  description: string;
  steps: string[];
  category: 'Stance' | 'Load' | 'Path' | 'Power' | 'Balance';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
}

export interface DrillProgress {
  drillId: string;
  completedAt: number;
  sessions: DrillSession[];
  rating?: number; // 1-5 stars
  notes?: string;
}

export interface DrillSession {
  date: number;
  duration: number; // minutes
  completed: boolean;
  rating?: number; // 1-5 stars
  notes?: string;
}

export interface UserSkillProfile {
  overallLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  strengths: string[]; // categories or specific skills
  weaknesses: string[]; // categories or specific skills
  recommendedFocus: string[];
  lastAssessment: number;
}

export type HistoryItem = {
  id: string;
  timestamp: number;
  type: 'analysis' | 'comparison';
  data: SwingReport | ComparativeReport;
  summaryTitle: string;
};

export type AppView = 'analysis' | 'drills' | 'compare' | 'history' | 'drill-detail';

export interface AnalysisState {
  currentView: AppView;
  selectedDrill: Drill | null;
  isAnalyzing: boolean;
  error: string | null;
  report: SwingReport | null;
  compareReport: ComparativeReport | null;
  history: HistoryItem[];
  drillProgress: DrillProgress[];
  userProfile: UserSkillProfile | null;
}
