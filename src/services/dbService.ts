import { set, get } from 'idb-keyval';
import { AppState } from '@/src/types';

const STORAGE_KEY = 'namduoc_app_state';

const initialState: AppState = {
  kpi: {
    entries: [],
    targets: { sales: 1000000, coverage: 100 },
    kpiItems: []
  },
  promotions: [],
  notes: [],
  documents: [],
  config: {
    holidays: [],
    weeklyOffDays: [0] // Default Sunday off
  },
  analysisHistory: []
};

export const dbService = {
  async saveState(state: AppState): Promise<void> {
    await set(STORAGE_KEY, state);
  },

  async getState(): Promise<AppState> {
    const state = await get<AppState>(STORAGE_KEY);
    return state || initialState;
  },

  async clear(): Promise<void> {
    await set(STORAGE_KEY, initialState);
  }
};
