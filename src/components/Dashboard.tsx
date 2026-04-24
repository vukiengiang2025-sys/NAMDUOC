import React from 'react';
import { motion } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, AlertCircle, Info, Tag } from 'lucide-react';

interface DashboardProps {
  stats: any;
  promotions: any[];
  notes: any[];
  onAnalyze: () => void;
  isAnalyzing: boolean;
  aiAnalysis: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  stats, 
  promotions, 
  notes, 
  onAnalyze, 
  isAnalyzing,
  aiAnalysis 
}) => {
  const data = [
    { name: 'Sales', value: stats.salesPace },
    { name: 'Remaining', value: Math.max(0, 100 - stats.salesPace) }
  ];

  const COLORS = ['#4f46e5', '#f1f5f9'];

  const runningPromotions = promotions.filter(p => {
    const now = new Date();
    return new Date(p.startDate) <= now && new Date(p.endDate) >= now;
  });

  const todayTasks = notes.filter(n => !n.completed);

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">
            N
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800">Xin chào!</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">{new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-2 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  innerRadius={32}
                  outerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pt-2">
              <span className="text-xl font-black text-slate-900">{stats.salesPace.toFixed(0)}%</span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Doanh số</span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center overflow-hidden"
        >
          <TrendingUp className={`w-8 h-8 mb-2 ${stats.salesDiff >= 0 ? 'text-emerald-500' : 'text-rose-500'}`} />
          <span className={`text-xl font-black ${stats.salesDiff >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {stats.salesDiff >= 0 ? '+' : ''}{stats.salesDiff.toFixed(1)}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-bold">So với tiến độ</span>
        </motion.div>
      </div>

      {/* Days Statistics */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="text-indigo-400" size={18} />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tiến độ thời gian</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400">{stats.passedWorkingDays} / {stats.totalWorkingDaysCount} Ngày</span>
        </div>
        
        <div className="flex justify-between items-end mb-4">
          <span className="text-4xl font-black">{stats.timePace.toFixed(0)}%</span>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Ngày còn lại</p>
            <p className="text-xl font-black text-indigo-400">{stats.remainingWorkingDaysCount}</p>
          </div>
        </div>

        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Cần đạt mỗi ngày:</span>
            <span className="font-bold text-indigo-300">{stats.dailyTargetSales.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
            <h2 className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">Gemini AI Insights</h2>
          </div>
          <button 
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="text-[10px] font-black text-indigo-600 bg-white shadow-sm border border-indigo-100 px-3 py-1 rounded-full active:scale-95 transition-transform uppercase"
          >
            {isAnalyzing ? '...' : 'Refresh'}
          </button>
        </div>
        {aiAnalysis ? (
           <div className="text-sm text-slate-700 leading-relaxed italic">
             {aiAnalysis}
           </div>
        ) : (
          <p className="text-xs text-indigo-400 italic">Click refresh for AI performance insights.</p>
        )}
      </div>

      {/* Active Promotions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khuyến mãi hiện hành</h2>
          <span className="text-[10px] text-slate-400 font-bold uppercase">{runningPromotions.length} CTKM</span>
        </div>
        {runningPromotions.length > 0 ? (
          <div className="space-y-3">
            {runningPromotions.slice(0, 2).map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3 transition-all hover:border-indigo-200">
                <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                  <Tag size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">{p.conditions}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-100 p-8 rounded-3xl text-center">
            <Info size={24} className="mx-auto text-slate-200 mb-2" />
            <p className="text-xs text-slate-400">Không có khuyến mãi nào đang diễn ra.</p>
          </div>
        )}
      </div>

      {/* Today Tasks */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Việc cần làm hôm nay</h2>
        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.slice(0, 3).map((note) => (
              <div key={note.id} className="flex items-center space-x-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:bg-slate-50">
                 <div className="w-5 h-5 rounded border border-slate-300 flex-shrink-0" />
                 <span className="text-sm font-medium text-slate-700 truncate">{note.title}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">Thật tuyệt! Không có việc nào còn tồn đọng.</p>
        )}
      </div>
    </div>
  );
};
