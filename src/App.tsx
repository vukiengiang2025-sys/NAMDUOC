/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Dashboard } from './components/Dashboard';
import { TargetSetup } from './components/TargetSetup';
import { PromotionUpload } from './components/PromotionUpload';
import { TaskBoard } from './components/TaskBoard';
import { SettingsPanel } from './components/SettingsPanel';
import { BottomNav } from './components/BottomNav';
import { DocumentVault } from './components/DocumentVault';
import { AppState, UserNote, Promotion, KpiEntry, WorkingConfig, KpiItem, Document } from './types';
import { dbService } from './services/dbService';
import { kpiService } from './services/kpiService';
import { geminiService } from './services/geminiService';
import { notificationService } from './services/notificationService';
import { motion, AnimatePresence } from 'motion/react';

const defaultKpiItems: KpiItem[] = [
  { id: 'sales', name: 'Doanh số', target: 0, actual: 0, unit: 'triệu VNĐ', type: 'sales' },
  { id: 'coverage', name: 'Độ phủ', target: 0, actual: 0, unit: 'nhà thuốc', type: 'coverage' },
  { id: 'mid_month', name: 'Tiến độ 15 tây (55%)', target: 55, actual: 0, unit: '%', type: 'mid_month' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [state, setState] = useState<AppState | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  // Initial Load
  useEffect(() => {
    const loadState = async () => {
      let saved = await dbService.getState();
      if (saved && (!saved.kpi.kpiItems || saved.kpi.kpiItems.length === 0)) {
        saved.kpi.kpiItems = defaultKpiItems;
      }
      setState(saved);
      
      // Request notification permissions
      await notificationService.requestPermissions();
    };
    loadState();
  }, []);

  // Update morning notification context when notes or config change
  useEffect(() => {
    if (!state) return;
    const updateNotifications = async () => {
      const pendingTasks = state.notes.filter(n => !n.completed);
      if (pendingTasks.length > 0) {
        const body = `Hôm nay bạn có ${pendingTasks.length} công việc cần hoàn thành. Chúc ngày mới làm việc hiệu quả!`;
        await notificationService.cancelAll();
        await notificationService.scheduleMorningNotification("Nam Dược KPI - Lịch làm việc hôm nay", body);
      }
    };
    updateNotifications();
  }, [state?.notes, state?.config]);

  // Auto-save on state change
  useEffect(() => {
    if (state) {
      dbService.saveState(state);
    }
  }, [state]);

  const stats = useMemo(() => {
    if (!state) return null;
    return kpiService.calculateStats(state.kpi, state.config);
  }, [state]);

  if (!state || !stats) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleKpiLoaded = (entries: KpiEntry[], kpiItems: KpiItem[]) => {
    setState(prev => prev ? ({
      ...prev,
      kpi: { 
        ...prev.kpi, 
        entries: [...prev.kpi.entries, ...entries],
        kpiItems: kpiItems.length > 0 ? kpiItems : prev.kpi.kpiItems
      }
    }) : null);
  };

  const handlePromotionsLoaded = async (promos: Promotion[]) => {
    // Note: If called from PromotionUpload, text extraction already happened.
    // If we were parsing raw text here, we'd pass state.config.geminiApiKey
    setState(prev => prev ? ({
      ...prev,
      promotions: [...prev.promotions, ...promos]
    }) : null);
  };

  const handleAddNote = (title: string, deadline?: string) => {
    const newNote: UserNote = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      deadline,
      completed: false,
      createdAt: new Date().toISOString(),
      content: ''
    };
    setState(prev => prev ? ({
      ...prev,
      notes: [newNote, ...prev.notes]
    }) : null);
  };

  const handleToggleNote = (id: string) => {
    setState(prev => prev ? ({
      ...prev,
      notes: prev.notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n)
    }) : null);
  };

  const handleDeleteNote = (id: string) => {
    setState(prev => prev ? ({
      ...prev,
      notes: prev.notes.filter(n => n.id !== id)
    }) : null);
  };

  const handleDeletePromotion = (id: string) => {
    setState(prev => prev ? ({
      ...prev,
      promotions: prev.promotions.filter(p => p.id !== id)
    }) : null);
  };

  const handleUpdateConfig = (config: WorkingConfig) => {
    setState(prev => prev ? ({ ...prev, config }) : null);
  };

  const handleAnalyze = async () => {
    if (!state) return;
    setIsAnalyzing(true);
    try {
      const result = await geminiService.analyzePerformance({
        totalSales: stats.totalSales,
        targetSales: stats.targetSales,
        totalCoverage: stats.totalCoverage,
        targetCoverage: stats.targetCoverage,
        daysPassed: stats.passedWorkingDays,
        daysRemaining: stats.remainingWorkingDaysCount,
        totalWorkingDays: stats.totalWorkingDaysCount,
        userProfile: state.config.userProfile,
        kpiItems: state.kpi.kpiItems,
        documents: state.documents
      }, 
      state.analysisHistory.slice(-3).map(h => h.content), // Lấy 3 lần phân tích gần nhất làm ngữ cảnh
      state.config.geminiApiKey);
      
      setAiAnalysis(result);
      
      // Save to history
      const newRecord = { date: new Date().toISOString(), content: result };
      setState(prev => prev ? ({
        ...prev,
        analysisHistory: [newRecord, ...prev.analysisHistory].slice(0, 10) // Lưu tối đa 10 bản ghi gần nhất
      }) : null);
    } catch (error: any) {
      console.error(error);
      setAiAnalysis(error?.message || "Không thể kết nối với Gemini AI. Vui lòng kiểm tra lại API Key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateKpiItem = (id: string, actual: number) => {
    setState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        kpi: {
          ...prev.kpi,
          kpiItems: prev.kpi.kpiItems.map(k => k.id === id ? { ...k, actual } : k)
        }
      };
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            promotions={state.promotions} 
            notes={state.notes} 
            kpiItems={state.kpi.kpiItems || []}
            onUpdateKpiItem={handleUpdateKpiItem}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
            aiAnalysis={aiAnalysis}
          />
        );
      case 'kpi':
        return (
          <TargetSetup 
            kpiItems={state.kpi.kpiItems || []} 
            onUpdateTargets={(newItems) => setState(prev => prev ? ({ ...prev, kpi: { ...prev.kpi, kpiItems: newItems } }) : null)}
            geminiApiKey={state.config.geminiApiKey}
            userProfileName={state.config.userProfile?.name}
          />
        );
      case 'vault':
        return (
          <DocumentVault 
            documents={state.documents || []} 
            onUpdateDocuments={(docs) => setState(prev => prev ? ({ ...prev, documents: docs }) : null)}
          />
        );
      case 'promotions':
        return (
          <PromotionUpload 
            promotions={state.promotions} 
            onPromotionsLoaded={handlePromotionsLoaded}
            onDelete={handleDeletePromotion}
            geminiApiKey={state.config.geminiApiKey}
          />
        );
      case 'notes':
        return (
          <TaskBoard 
            notes={state.notes} 
            onAdd={handleAddNote} 
            onToggle={handleToggleNote} 
            onDelete={handleDeleteNote} 
          />
        );
      case 'settings':
        return (
          <SettingsPanel 
            config={state.config} 
            onUpdateConfig={handleUpdateConfig}
            onClearAll={() => {
              if (confirm("Xác nhận xóa toàn bộ dữ liệu? Hành động này không thể hoàn tác.")) {
                dbService.clear().then(() => window.location.reload());
              }
            }}
          />
        );
      default:
        return <Dashboard stats={stats} promotions={state.promotions} notes={state.notes} kpiItems={state.kpi.kpiItems || []} onUpdateKpiItem={handleUpdateKpiItem} onAnalyze={handleAnalyze} isAnalyzing={isAnalyzing} aiAnalysis={aiAnalysis} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans max-w-md mx-auto relative overflow-x-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

