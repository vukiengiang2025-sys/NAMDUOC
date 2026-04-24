import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { fileService } from '../services/fileService';
import { geminiService } from '../services/geminiService';
import { KpiEntry, KpiItem } from '../types';

interface KpiUploadProps {
  onDataLoaded: (entries: KpiEntry[], kpiItems: KpiItem[]) => void;
  entries: KpiEntry[];
  onClear: () => void;
  geminiApiKey?: string;
  userProfileName?: string;
}

export const KpiUpload: React.FC<KpiUploadProps> = ({ onDataLoaded, entries, onClear, geminiApiKey, userProfileName }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!userProfileName) {
      setError("Vui lòng nhập Họ Tên trong Cài đặt để AI chỉ trích xuất dữ liệu của riêng bạn từ file chung.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const csvDataTab1 = await fileService.parseKpiExcelRawAsCsv(file, 0);
      const extractedData = await geminiService.extractKpiFromCsv(csvDataTab1, userProfileName, geminiApiKey);
      
      const csvDataTab2 = await fileService.parseKpiExcelRawAsCsv(file, 1);
      let extractedKpiItems: KpiItem[] = [];
      
      if (csvDataTab2) {
        const rawKpis = await geminiService.extractKpiTargetsFromCsv(csvDataTab2, userProfileName, geminiApiKey);
        extractedKpiItems = rawKpis.map(k => ({
          id: Math.random().toString(36).substr(2, 9),
          name: k.name,
          target: k.target,
          actual: 0
        }));
      }

      if (extractedData.length === 0 && extractedKpiItems.length === 0) {
        setError(`Không tìm thấy dữ liệu cho bảng tên "${userProfileName}". Hãy kiểm tra lại file hoặc tên trên phần Cài Đặt.`);
      } else {
        onDataLoaded(extractedData, extractedKpiItems);
      }
    } catch (err: any) {
      setError(err?.message || "Lỗi đọc file Excel hoặc phân tích. Kiểm tra định dạng và API Key.");
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-8 pb-24">
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-slate-800">Quản lý dữ liệu KPI</h2>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Upload file Excel để theo dõi tiến độ</p>
      </div>

      <label className="block">
        <div className={`mt-4 border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isUploading ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200 hover:border-red-300 hover:bg-red-50/30 shadow-sm'
        }`}>
          <Upload className={`w-12 h-12 mb-4 ${isUploading ? 'text-slate-400 animate-bounce' : 'text-red-400'}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${isUploading ? 'text-slate-500' : 'text-red-600'}`}>
            {isUploading ? 'Đang phân tích...' : 'Nạp dữ liệu Excel'}
          </span>
          <span className="text-[10px] text-slate-400 mt-2">Dữ liệu doanh số & độ phủ (.xlsx)</span>
          <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileChange} disabled={isUploading} />
        </div>
      </label>

      {error && (
        <div className="bg-rose-50 p-4 rounded-2xl flex items-start space-x-3 text-rose-700 border border-rose-100">
          <XCircle size={18} className="shrink-0 mt-0.5" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dữ liệu nạp vào ({entries.length})</h3>
            <button 
              onClick={onClear}
              className="text-slate-300 hover:text-rose-600 p-2 transition-colors focus:outline-none"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-[11px]">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-tighter">Ngày</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-tighter">Doanh số</th>
                  <th className="p-4 font-bold text-slate-500 uppercase tracking-tighter">Độ phủ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {entries.slice(0, 5).map((e, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-4 text-slate-500 font-medium">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="p-4 font-black text-slate-900">{e.sales.toLocaleString()}</td>
                    <td className="p-4 font-black text-slate-900">{e.coverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {entries.length > 5 && (
              <div className="p-3 text-center text-[9px] font-bold uppercase tracking-widest text-slate-300 bg-slate-50/30">
                Hiển thị 5 dòng gần nhất
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
