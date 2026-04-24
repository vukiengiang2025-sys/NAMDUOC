import React from 'react';
import { Trash2, ShieldCheck, Database, Calendar } from 'lucide-react';
import { WorkingConfig } from '../types';

interface SettingsProps {
  config: WorkingConfig;
  onUpdateConfig: (config: WorkingConfig) => void;
  onClearAll: () => void;
}

export const SettingsPanel: React.FC<SettingsProps> = ({ config, onUpdateConfig, onClearAll }) => {
  const days = [
    { id: 0, label: 'CN' },
    { id: 1, label: 'T2' },
    { id: 2, label: 'T3' },
    { id: 3, label: 'T4' },
    { id: 4, label: 'T5' },
    { id: 5, label: 'T6' },
    { id: 6, label: 'T7' },
  ];

  const toggleDay = (id: number) => {
    const newDays = config.weeklyOffDays.includes(id)
      ? config.weeklyOffDays.filter(d => d !== id)
      : [...config.weeklyOffDays, id];
    onUpdateConfig({ ...config, weeklyOffDays: newDays });
  };

  return (
    <div className="p-6 space-y-10 pb-32">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">Cài đặt hệ thống</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Cấu hình thời gian & Dữ liệu cá nhân</p>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <Calendar className="mr-2 text-red-500" size={16} />
          Ngày nghỉ hàng tuần
        </h3>
        <div className="flex justify-between gap-2">
          {days.map(day => (
            <button
              key={day.id}
              onClick={() => toggleDay(day.id)}
              className={`flex-1 h-12 rounded-2xl flex items-center justify-center text-[11px] font-black transition-all ${
                config.weeklyOffDays.includes(day.id)
                  ? 'bg-red-600 text-white shadow-lg shadow-red-100'
                  : 'bg-white border border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <Database className="mr-2 text-red-500" size={16} />
          Hồ sơ cá nhân (Context AI)
        </h3>
        <div className="space-y-3">
          <input 
            type="text"
            value={config.userProfile?.name || ''}
            onChange={(e) => onUpdateConfig({ ...config, userProfile: { ...(config.userProfile || { name: '', region: '', experience: '' }), name: e.target.value } })}
            placeholder="Họ và tên..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input 
            type="text"
            value={config.userProfile?.region || ''}
            onChange={(e) => onUpdateConfig({ ...config, userProfile: { ...(config.userProfile || { name: '', region: '', experience: '' }), region: e.target.value } })}
            placeholder="Khu vực phụ trách (ví dụ: Hà Nội 1)..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <input 
            type="text"
            value={config.userProfile?.experience || ''}
            onChange={(e) => onUpdateConfig({ ...config, userProfile: { ...(config.userProfile || { name: '', region: '', experience: '' }), experience: e.target.value } })}
            placeholder="Kinh nghiệm (ví dụ: 3 năm)..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <Database className="mr-2 text-red-500" size={16} />
          Cấu hình Gemini AI
        </h3>
        <div className="space-y-2">
          <p className="text-[10px] text-slate-400 leading-relaxed uppercase font-bold">Gemini API Key</p>
          <input 
            type="password"
            value={config.geminiApiKey || ''}
            onChange={(e) => onUpdateConfig({ ...config, geminiApiKey: e.target.value })}
            placeholder="Dán API Key của bạn tại đây..."
            className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-xs focus:ring-2 focus:ring-red-500 outline-none shadow-sm"
          />
          <p className="text-[9px] text-slate-400">Key được lưu cục bộ trên thiết bị của bạn.</p>
        </div>
      </div>

      <div className="space-y-6 pt-6 border-t border-slate-100">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
          <Database className="mr-2 text-red-500" size={16} />
          Quyền riêng tư
        </h3>
        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-6">
           <div className="flex items-start space-x-3">
             <ShieldCheck size={20} className="text-red-600 shrink-0" />
             <p className="text-xs text-red-900 leading-relaxed font-medium">
               Ứng dụng hoạt động Offline-First. Toàn bộ dữ liệu Excel, DOCX và ghi chú chỉ tồn tại trên thiết bị này.
             </p>
           </div>
           
           <button 
            onClick={onClearAll}
            className="w-full py-4 bg-white text-rose-600 rounded-2xl text-[11px] font-black border border-rose-100 active:scale-95 transition-transform flex items-center justify-center uppercase tracking-widest shadow-sm"
           >
             <Trash2 size={16} className="mr-2" />
             Xóa dữ liệu cục bộ
           </button>
        </div>
      </div>

      <div className="text-center pt-8">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">Nam Dược Assistant v1.0.0</p>
        <p className="text-[8px] text-slate-200 mt-1 uppercase">Powered by Gemini AI</p>
      </div>
    </div>
  );
};
