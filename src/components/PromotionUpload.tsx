import React, { useState } from 'react';
import { Upload, Tag, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { fileService } from '../services/fileService';
import { geminiService } from '../services/geminiService';
import { Promotion } from '../types';

interface PromotionUploadProps {
  promotions: Promotion[];
  onPromotionsLoaded: (promotions: Promotion[]) => void;
  onDelete: (id: string) => void;
  geminiApiKey?: string;
}

export const PromotionUpload: React.FC<PromotionUploadProps> = ({ 
  promotions, 
  onPromotionsLoaded, 
  onDelete,
  geminiApiKey
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    try {
      const text = await fileService.extractDocxText(file);
      const extracted = await geminiService.extractPromotions(text, geminiApiKey);
      onPromotionsLoaded(extracted);
    } catch (err: any) {
      setError(err?.message || "Không thể trích xuất chương trình khuyến mãi. Đảm bảo file DOCX hợp lệ và API Key đã được thiết lập.");
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shadow-sm border border-orange-100 shrink-0">
          <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4e2/512.gif" alt="Megaphone" className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800">Khuyến mãi</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">AI trích xuất từ file DOCX</p>
        </div>
      </div>

      <label className="block">
        <div className={`mt-4 border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isProcessing ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/30'
        }`}>
          <Upload className={`w-12 h-12 mb-4 ${isProcessing ? 'text-slate-400 animate-pulse' : 'text-red-400'}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${isProcessing ? 'text-slate-500' : 'text-red-600'}`}>
            {isProcessing ? 'AI đang bóc tách...' : 'Nạp file chính sách KM'}
          </span>
          <span className="text-[10px] text-slate-400 mt-2">Định dạng file .docx (Mammoth text extract)</span>
          <input type="file" className="hidden" accept=".docx" onChange={handleFileChange} disabled={isProcessing} />
        </div>
      </label>

      {error && (
        <div className="bg-rose-50 p-4 rounded-2xl flex items-start space-x-3 text-rose-700 border border-rose-100">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chương trình hiện có ({promotions.length})</h3>
        {promotions.length > 0 ? (
          <div className="space-y-4">
            {promotions.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative group overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-red-50 text-red-700 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-red-100">
                    Sống khỏe
                  </div>
                  <button 
                    onClick={() => onDelete(p.id)}
                    className="text-slate-200 hover:text-rose-600 transition-colors focus:outline-none"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <h4 className="font-bold text-slate-800 mb-2 leading-tight">{p.name}</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 italic text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800 non-italic mr-1">Điều kiện:</span>
                    {p.conditions}
                  </div>
                  <p className="text-[11px] text-slate-500"><span className="font-bold text-slate-700">Sản phẩm:</span> {p.products.join(', ')}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                   <div className="flex items-center space-x-1">
                     <Calendar size={12} className="text-red-400" />
                     <span>{new Date(p.startDate).toLocaleDateString()} — {new Date(p.endDate).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-100 p-12 rounded-3xl text-center">
            <Tag size={32} className="mx-auto text-slate-200 mb-2" />
            <p className="text-sm text-slate-300">Chưa có thông tin cập nhật.</p>
          </div>
        )}
      </div>
    </div>
  );
};
