export interface KpiEntry {
  date: string;
  sales: number;
  coverage: number;
}

export interface KpiItem {
  id: string;
  name: string;
  target: number;
  actual: number;
  unit?: string;
  type?: 'sales' | 'coverage' | 'mid_month' | 'other';
}

export interface KpiData {
  entries: KpiEntry[];
  targets: {
    sales: number;
    coverage: number;
  };
  kpiItems: KpiItem[];
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
  userProfile?: {
    name: string;
    region: string;
    experience: string;
  };
}

export interface AnalysisRecord {
  date: string;
  content: string;
  type: 'daily' | 'promotion' | 'strategic';
}

export interface Document {
  id: string;
  name: string;
  type: string;
  content: string;
  createdAt: string;
}

export interface AppState {
  kpi: KpiData;
  promotions: Promotion[];
  notes: UserNote[];
  documents?: Document[];
  config: WorkingConfig;
  analysisHistory: AnalysisRecord[];
}
