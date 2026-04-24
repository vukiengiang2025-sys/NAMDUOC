import React, { useState } from 'react';
import { Upload, CheckCircle, Edit2, Check, Target } from 'lucide-react';
import { fileService } from '../services/fileService';
import { geminiService } from '../services/geminiService';
import { KpiItem } from '../types';

interface TargetSetupProps {
  kpiItems: KpiItem[];
  onUpdateTargets: (items: KpiItem[]) => void;
  geminiApiKey?: string;
  userProfileName?: string;
}

export const TargetSetup: React.FC<TargetSetupProps> = ({ kpiItems, onUpdateTargets, geminiApiKey, userProfileName }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempName, setTempName] = useState('');
  const [tempTarget, setTempTarget] = useState('');
  const [tempUnit, setTempUnit] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfileName) {
      setError("Vui lòng nhập Họ Tên trong Cài đặt để AI chỉ trích xuất dữ liệu của riêng bạn.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);
    try {
      const csvDataTab2 = await fileService.parseKpiExcelRawAsCsv(file, 1);
      if (!csvDataTab2) {
        throw new Error("Không thể đọc Tab 2 (Chỉ tiêu) của file Excel.");
      }
      
      const extractedTargets = await geminiService.extractKpiTargetsFromCsv(csvDataTab2, userProfileName, geminiApiKey);
      
      if (extractedTargets.length === 0) {
        setError(`Không tìm thấy chỉ tiêu cho "${userProfileName}".`);
      } else {
        const newItems: KpiItem[] = extractedTargets.map(t => ({
          id: Math.random().toString(36).substr(2, 9),
          name: t.name,
          target: t.target,
          actual: 0,
          unit: 'Số lượng',
          type: 'other'
        }));
        
        // Merge with existing ones (keep existing, add new)
        onUpdateTargets([...kpiItems, ...newItems]);
        setSuccess("Đã bóc tách thành công chỉ tiêu từ Excel!");
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi đọc file Excel hoặc phân tích. Kiểm tra định dạng và API Key.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveItem = (id: string) => {
    onUpdateTargets(kpiItems.map(item => 
      item.id === id 
        ? { ...item, name: tempName, target: Number(tempTarget), unit: tempUnit } 
        : item
    ));
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">Thiết lập Chỉ Tiêu</h1>
          <p className="text-sm text-slate-500">Đầu tháng: cấu hình các mục tiêu trong tháng.</p>
        </div>
        <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 shadow-sm border border-red-200">
          <Target size={24} />
        </div>
      </div>

      <label className="block">
        <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isUploading ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/30 shadow-sm'
        }`}>
          <Upload className={`w-10 h-10 mb-4 ${isUploading ? 'text-slate-400 animate-bounce' : 'text-red-400'}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${isUploading ? 'text-slate-500' : 'text-red-600'}`}>
            {isUploading ? 'Đang phân tích Tab 2...' : 'Nạp file Excel (Tab 2)'}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 text-center">AI đọc tab 2 lấy chỉ tiêu phụ (SKU, Khách mới...)</span>
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </div>
      </label>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs flex items-center space-x-2 border border-red-100">
          <XCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl text-xs flex items-center space-x-2 border border-emerald-100">
          <CheckCircle size={16} className="shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <div className="space-y-4">
         <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Danh sách chỉ tiêu</h2>
         <div className="grid grid-cols-1 gap-3">
           {kpiItems.map(item => (
             <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
               {editingId === item.id ? (
                  <div className="space-y-3">
                     <input 
                       className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-red-500 outline-none"
                       value={tempName} onChange={e => setTempName(e.target.value)} placeholder="Tên chỉ tiêu"
                     />
                     <div className="flex space-x-2">
                       <input 
                         type="number"
                         className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:ring-1 focus:ring-red-500 outline-none"
                         value={tempTarget} onChange={e => setTempTarget(e.target.value)} placeholder="Mục tiêu"
                       />
                       <input 
                         className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-red-500 outline-none"
                         value={tempUnit} onChange={e => setTempUnit(e.target.value)} placeholder="Đơn vị (VD: Tr VNĐ)"
                       />
                     </div>
                     <button onClick={() => handleSaveItem(item.id)} className="w-full bg-red-600 text-white rounded-lg py-2 text-xs font-bold flex justify-center items-center">
                       <Check size={16} className="mr-1" /> Lưu
                     </button>
                  </div>
               ) : (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Mục tiêu: <span className="font-bold text-slate-900">{item.target.toLocaleString()}</span> {item.unit}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setTempName(item.name);
                        setTempTarget(item.target.toString());
                        setTempUnit(item.unit || '');
                        setEditingId(item.id);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
               )}
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};
