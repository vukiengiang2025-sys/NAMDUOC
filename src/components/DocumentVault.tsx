import React, { useState } from 'react';
import { Upload, FileText, Trash2, CheckCircle, XCircle, Database } from 'lucide-react';
import { fileService } from '../services/fileService';
import { Document } from '../types';

interface DocumentVaultProps {
  documents: Document[];
  onUpdateDocuments: (docs: Document[]) => void;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({ documents, onUpdateDocuments }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const content = await fileService.extractFileText(file);
      
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type || file.name.split('.').pop() || 'unknown',
        content: content.trim(),
        createdAt: new Date().toISOString()
      };

      onUpdateDocuments([newDoc, ...documents]);
    } catch (err: any) {
      setError(err?.message || "Lỗi đọc file. Chỉ hỗ trợ DOCX, XLSX, TXT, CSV.");
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = (id: string) => {
    onUpdateDocuments(documents.filter(doc => doc.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tighter text-slate-900">Kho tài liệu</h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">AI Gemini tham khảo dữ liệu ở đây</p>
        </div>
        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100">
          <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4c2/512.gif" alt="Folder Vault" className="w-8 h-8" />
        </div>
      </div>

      <label className="block">
        <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer ${
          isUploading ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 shadow-sm'
        }`}>
          <Upload className={`w-10 h-10 mb-4 ${isUploading ? 'text-slate-400 animate-bounce' : 'text-indigo-400'}`} />
          <span className={`text-xs font-black uppercase tracking-widest ${isUploading ? 'text-slate-500' : 'text-indigo-600'}`}>
            {isUploading ? 'Đang đọc nội dung...' : 'Tải lên tài liệu'}
          </span>
          <span className="text-[10px] text-slate-400 mt-2 text-center">Hỗ trợ: DOCX, XLSX, TXT, CSV</span>
          <input type="file" accept=".docx,.xlsx,.xls,.csv,.txt,.md" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
        </div>
      </label>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs flex items-center space-x-2 border border-red-100">
          <XCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-4">
         <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tài liệu đã lưu</h2>
         {documents.length === 0 ? (
           <div className="bg-slate-50 border border-slate-100 p-8 rounded-3xl flex flex-col items-center justify-center text-center">
             <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f47b/512.gif" alt="Ghost" className="w-10 h-10 mb-2 opacity-30" />
             <p className="text-xs text-slate-400 font-bold">Chưa có tài liệu nào.</p>
           </div>
         ) : (
           <div className="grid grid-cols-1 gap-3">
             {documents.map(doc => (
               <div key={doc.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start space-x-3">
                 <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600 shrink-0">
                   <FileText size={16} />
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                   <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">{(doc.content.length / 1000).toFixed(1)} KB text • {new Date(doc.createdAt).toLocaleDateString()}</p>
                 </div>
                 <button 
                   onClick={() => handleDelete(doc.id)}
                   className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
             ))}
           </div>
         )}
      </div>
    </div>
  );
};
