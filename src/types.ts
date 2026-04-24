export interface KpiEntry {
  date: string;
  sales: number;
  coverage: number;
}

export interface KpiData {
  entries: KpiEntry[];
  targets: {
    sales: number;
    coverage: number;
  };
}

export interface Promotion {
  id: string;
  name: string;
  products: string[];
  conditions: string;
  startDate: string;
  endDate: string;
}

export interface UserNote {
  id: string;
  title: string;
  content: string;
  deadline?: string;
  completed: boolean;
  createdAt: string;
}

export interface WorkingConfig {
  holidays: string[]; // ISO dates
  weeklyOffDays: number[]; // 0=Sunday, 6=Saturday
  geminiApiKey?: string;
}

export interface AnalysisRecord {
  date: string;
  content: string;
  type: 'daily' | 'promotion' | 'strategic';
}

export interface AppState {
  kpi: KpiData;
  promotions: Promotion[];
  notes: UserNote[];
  config: WorkingConfig;
  analysisHistory: AnalysisRecord[];
  userProfile?: {
    name: string;
    region: string;
    experience: string;
  };
}
