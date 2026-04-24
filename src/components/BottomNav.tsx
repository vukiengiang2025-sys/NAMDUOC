import React from 'react';
import { Home, BarChart2, Tag, Notebook, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Bàn làm việc' },
    { id: 'kpi', icon: BarChart2, label: 'KPI' },
    { id: 'promotions', icon: Tag, label: 'KM' },
    { id: 'notes', icon: Notebook, label: 'Ghi chú' },
    { id: 'settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <nav className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
      <div className="bg-white px-6 py-2 rounded-full shadow-xl border border-slate-100 flex gap-6 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center px-2 transition-all ${
                isActive ? 'text-indigo-600 scale-110' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-2'} />
              <span className={`text-[8px] mt-0.5 font-black uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {tab.id.slice(0, 4)}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
